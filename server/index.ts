import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { buildIndex, retrieve, formatContext, getStats } from './rag.js';
import { register, login, googleAuth, requireAuth, type AuthRequest } from './auth.js';
import { connectDB, User, Plan, Progress } from './db.js';

// ── Credit pricing (USD per million tokens) ──────────────────────────
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-6':  { input: 15.00, output: 75.00 },
  'claude-haiku-4-5': { input: 0.80,  output: 4.00  },
};

function calcCost(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model] ?? PRICING['claude-opus-4-6'];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

async function checkCredits(userId: string): Promise<boolean> {
  const user = await User.findById(userId).select('credits').lean();
  if (!user) return false;
  const credits = (user as any).credits;
  // Pre-existing users won't have credits field — initialize them with $5
  if (credits === undefined || credits === null) {
    await User.findByIdAndUpdate(userId, { credits: 5.00, creditsUsed: 0.00 });
    return true;
  }
  return credits > 0;
}

async function deductCredits(userId: string, cost: number): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $inc: { credits: -cost, creditsUsed: cost },
  });
}

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are APEX, an elite AI fitness coach. You communicate like a knowledgeable, encouraging personal trainer — direct, practical, science-backed, and warm.

Your role is to:
1. During onboarding: ask targeted questions to understand the user's athlete identity, goals, schedule, equipment, and constraints
2. Generate personalized, periodized training plans with real exercises, sets, reps, and progressions
3. Provide evidence-based nutrition guidance tailored to their goals
4. Adjust plans based on feedback, recovery data, or goal changes
5. Explain the "why" behind recommendations

Style rules:
- Be conversational, not clinical. Sound like a coach, not a textbook.
- Use specific exercise names and rep schemes, not vague guidance.
- When the user describes a goal in natural language ("I want to feel more athletic"), translate it into concrete training variables.
- Reference the provided fitness knowledge when relevant, but synthesize it naturally — don't just quote it verbatim.
- Keep responses focused and actionable. Avoid unnecessary disclaimers.
- For safety: note if exercises should be progressed carefully, but don't add excessive medical disclaimers.

You have access to a database of 800+ real exercises and evidence-based training/nutrition knowledge. Use this to give specific, accurate recommendations.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ── Auth routes (public) ─────────────────────────────────────────────
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/google', googleAuth);

// POST /api/chat — streaming SSE endpoint
app.post('/api/chat', requireAuth, async (req, res) => {
  const { messages, userProfile } = req.body as {
    messages: Message[];
    userProfile?: Record<string, string>;
  };

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' });
  }

  // Build query from the latest user message + profile context
  const latestUserMessage = messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
  const profileContext = userProfile
    ? Object.entries(userProfile).map(([k, v]) => `${k}: ${v}`).join(', ')
    : '';
  const retrievalQuery = `${latestUserMessage} ${profileContext}`;

  // RAG: semantic search via ChromaDB
  const relevantDocs = await retrieve(retrievalQuery, 8);
  const ragContext = formatContext(relevantDocs);

  // Build system prompt with RAG context
  const systemWithContext = ragContext
    ? `${SYSTEM_PROMPT}\n\n─── RELEVANT FITNESS KNOWLEDGE (retrieved for this query) ───\n${ragContext}\n─────────────────────────────────────────────────────────`
    : SYSTEM_PROMPT;

  // Set up SSE stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Claude API error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message ?? 'Unknown error' })}\n\n`);
    res.end();
  }
});

// POST /api/plan/generate — generate a structured JSON training plan
app.post('/api/plan/generate', requireAuth, async (req, res) => {
  const { userProfile, conversationHistory } = req.body as {
    userProfile: Record<string, string>;
    conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  };

  if (!userProfile || !conversationHistory?.length) {
    return res.status(400).json({ error: 'userProfile and conversationHistory required' });
  }

  const retrievalQuery = [
    userProfile.athleteIdentity,
    userProfile.goals,
    userProfile.schedule,
    userProfile.diet,
    'training plan programming periodization progressive overload nutrition meal plan',
  ].filter(Boolean).join(' ');

  const relevantDocs = await retrieve(retrievalQuery, 10);
  const ragContext = formatContext(relevantDocs);

  // ── Prompt 1: Training plan only (no mealPlan) ──────────────────
  const TRAINING_PROMPT = `You are a JSON-only training plan generator. Respond with a single valid JSON object only — no markdown, no explanation.

Return EXACTLY this structure:
{
  "planName": string,
  "goal": string,
  "totalWeeks": 8,
  "weeksPerPhase": 2,
  "generatedAt": "ISO_TIMESTAMP",
  "programSummary": string,
  "weeks": [
    {
      "weekNumber": 1,
      "label": string,
      "theme": string,
      "days": [
        {
          "dayOfWeek": "Mon",
          "name": string,
          "type": "strength"|"cardio"|"conditioning"|"rest"|"mobility",
          "focus": string,
          "durationMinutes": number,
          "exercises": [{ "name": string, "sets": number, "reps": string, "weight": string, "notes": string }],
          "coachTip": string
        }
      ]
    }
  ]
}

Rules:
- weeks array: exactly 2 objects (weekNumber 1 and 2)
- days array: exactly 7 objects per week in order Mon–Sun
- Rest/mobility days: durationMinutes 0, exercises []
- Training days: 4-6 exercises each
- reps: strings like "6", "8-10", "AMRAP", "60 sec"
- weight: "BW", "Light", "Moderate", "RPE 7", or specific lbs
- coachTip: non-empty for every day including rest days
- programSummary: describes the full 8-week arc
- generatedAt: valid ISO 8601 timestamp
- Calibrate precisely to experience level, equipment, injuries, schedule`;

  // ── Prompt 2: Meal plan only ─────────────────────────────────────
  const MEAL_PROMPT = `You are a JSON-only nutrition planner. Respond with a single valid JSON object only — no markdown, no explanation.

Return EXACTLY this structure:
{
  "dailyCalories": number,
  "dietaryPattern": string,
  "macros": { "proteinG": number, "carbsG": number, "fatG": number },
  "meals": [
    { "name": string, "timing": string, "calories": number, "proteinG": number, "options": [string, string] }
  ],
  "guidelines": [string, string, string],
  "avoidList": [string, string, string]
}

Rules:
- dietaryPattern: reflects user's diet ("omnivore","vegetarian","vegan","pescatarian", etc.)
- meals: 4-5 entries covering Breakfast, Lunch, Dinner, Snack, and optionally Pre/Post-workout
- each options array: exactly 2 concrete food examples with calorie and protein info in parentheses
- guidelines: exactly 3 actionable nutrition tips for this user's goal and diet
- avoidList: exactly 3 foods or habits to minimize
- ALL recommendations must strictly respect dietary restrictions`;

  const profileSummary = `User Profile:
- Athlete identity: ${userProfile.athleteIdentity ?? 'Not specified'}
- Goals: ${userProfile.goals ?? 'Not specified'}
- Schedule: ${userProfile.schedule ?? 'Not specified'}
- Injuries/limitations: ${userProfile.injuries ?? 'None reported'}
- Diet / food preferences: ${userProfile.diet ?? userProfile.nutrition ?? 'Not specified'}

Full onboarding conversation:
${conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'APEX'}: ${m.content}`).join('\n\n')}`;

  const trainingSystemPrompt = ragContext
    ? `${TRAINING_PROMPT}\n\nRelevant fitness knowledge:\n${ragContext}`
    : TRAINING_PROMPT;

  const mealSystemPrompt = ragContext
    ? `${MEAL_PROMPT}\n\nRelevant nutrition knowledge:\n${ragContext}`
    : MEAL_PROMPT;

  const authReq2 = req as AuthRequest;
  if (!(await checkCredits(authReq2.userId!))) {
    return res.status(402).json({ error: 'out_of_credits', message: 'You have used all your free credits. Please add more to continue.' });
  }

  function stripFences(raw: string) {
    return raw.replace(/^```(?:json)?[\r\n]*/i, '').replace(/[\r\n]*```\s*$/i, '').trim();
  }

  function parseJSON(raw: string, label: string) {
    const text = stripFences(raw);
    try {
      return JSON.parse(text);
    } catch {
      console.error(`${label} JSON parse failed:`, raw.slice(0, 300));
      return null;
    }
  }

  try {
    const model = 'claude-haiku-4-5';

    // Run both calls in parallel
    const [trainingRes, mealRes] = await Promise.all([
      anthropic.messages.create({
        model,
        max_tokens: 8000,
        system: trainingSystemPrompt,
        messages: [{ role: 'user', content: `${profileSummary}\n\nGenerate the training plan JSON now.` }],
      }),
      anthropic.messages.create({
        model,
        max_tokens: 2000,
        system: mealSystemPrompt,
        messages: [{ role: 'user', content: `${profileSummary}\n\nGenerate the meal plan JSON now.` }],
      }),
    ]);

    const plan = parseJSON(
      trainingRes.content[0].type === 'text' ? trainingRes.content[0].text : '',
      'Training plan'
    );
    if (!plan) {
      return res.status(500).json({ error: 'Plan generation produced invalid JSON. Please retry.' });
    }

    const mealPlan = parseJSON(
      mealRes.content[0].type === 'text' ? mealRes.content[0].text : '',
      'Meal plan'
    );
    if (mealPlan) plan.mealPlan = mealPlan;

    if (!plan.generatedAt || plan.generatedAt.includes('<') || plan.generatedAt.includes('ISO')) {
      plan.generatedAt = new Date().toISOString();
    }

    const totalCost =
      calcCost(model, trainingRes.usage.input_tokens, trainingRes.usage.output_tokens) +
      calcCost(model, mealRes.usage.input_tokens,  mealRes.usage.output_tokens);
    await deductCredits(authReq2.userId!, totalCost);

    // Auto-save to MongoDB
    await Plan.findOneAndUpdate(
      { userId: authReq2.userId },
      { userId: authReq2.userId, ...plan },
      { upsert: true, new: true }
    );
    await Progress.findOneAndUpdate(
      { userId: authReq2.userId },
      { userId: authReq2.userId, completedDays: [] },
      { upsert: true }
    );

    res.json({ plan });
  } catch (err: any) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
});

// POST /api/chat/complete — non-streaming endpoint for React Native
app.post('/api/chat/complete', requireAuth, async (req, res) => {
  const { messages, userProfile, planContext } = req.body as {
    messages: Message[];
    userProfile?: Record<string, string>;
    planContext?: string;
  };

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' });
  }

  const latestUserMessage = messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
  const profileContext = userProfile
    ? Object.entries(userProfile).map(([k, v]) => `${k}: ${v}`).join(', ')
    : '';
  const retrievalQuery = `${latestUserMessage} ${profileContext}`;

  const relevantDocs = await retrieve(retrievalQuery, 8);
  const ragContext = formatContext(relevantDocs);

  const systemWithContext = [
    SYSTEM_PROMPT,
    planContext
      ? `\n\n─── USER'S CURRENT TRAINING PLAN ───\n${planContext}\n─────────────────────────────────────────────────────────`
      : '',
    ragContext
      ? `\n\n─── RELEVANT FITNESS KNOWLEDGE (retrieved for this query) ───\n${ragContext}\n─────────────────────────────────────────────────────────`
      : '',
  ].join('');

  const authReq = req as AuthRequest;
  if (!(await checkCredits(authReq.userId!))) {
    return res.status(402).json({ error: 'out_of_credits', message: 'You have used all your free credits. Please add more to continue.' });
  }

  try {
    const model = 'claude-opus-4-6';
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cost = calcCost(model, response.usage.input_tokens, response.usage.output_tokens);
    await deductCredits(authReq.userId!, cost);

    res.json({ text });
  } catch (err: any) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
});

// GET /api/credits — user's credit balance
app.get('/api/credits', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select('credits creditsUsed').lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    credits: Math.max(0, parseFloat(((user as any).credits ?? 0).toFixed(4))),
    creditsUsed: parseFloat(((user as any).creditsUsed ?? 0).toFixed(4)),
  });
});

// GET /api/stats — RAG index info
app.get('/api/stats', (_req, res) => {
  res.json(getStats());
});

// ── Plan routes ──────────────────────────────────────────────────────

// Save plan after generation
app.post('/api/plan', requireAuth, async (req: AuthRequest, res) => {
  const { plan } = req.body;
  if (!plan) return res.status(400).json({ error: 'plan required' });
  const saved = await Plan.findOneAndUpdate(
    { userId: req.userId },
    { userId: req.userId, ...plan },
    { upsert: true, new: true }
  );
  res.json({ plan: saved });
});

// Load user's plan
app.get('/api/plan', requireAuth, async (req: AuthRequest, res) => {
  const plan = await Plan.findOne({ userId: req.userId }).lean();
  res.json({ plan: plan ?? null });
});

// Delete plan (reset)
app.delete('/api/plan', requireAuth, async (req: AuthRequest, res) => {
  await Plan.deleteOne({ userId: req.userId });
  await Progress.deleteOne({ userId: req.userId });
  res.json({ ok: true });
});

// ── Progress routes ──────────────────────────────────────────────────

// Get progress
app.get('/api/progress', requireAuth, async (req: AuthRequest, res) => {
  const progress = await Progress.findOne({ userId: req.userId }).lean();
  res.json({ progress: progress ?? { completedDays: [] } });
});

// Mark a day complete
app.post('/api/progress/complete', requireAuth, async (req: AuthRequest, res) => {
  const { dayKey } = req.body as { dayKey?: string }; // e.g. "w1-Mon"
  if (!dayKey) return res.status(400).json({ error: 'dayKey required' });
  const progress = await Progress.findOneAndUpdate(
    { userId: req.userId },
    { $addToSet: { completedDays: dayKey } },
    { upsert: true, new: true }
  );
  res.json({ progress });
});

// ── Startup ──────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001;

async function start() {
  await connectDB();
  await buildIndex();
  app.listen(PORT, () => {
    console.log(`\n🚀 APEX Fitness API running on http://localhost:${PORT}`);
    console.log(`   RAG index: ${getStats().totalDocs} documents`);
    console.log(`   Claude model: claude-opus-4-6\n`);
  });
}

start();
