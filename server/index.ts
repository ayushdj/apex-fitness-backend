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
  return !!user && (user as any).credits > 0;
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
    'training plan programming periodization progressive overload',
  ].filter(Boolean).join(' ');

  const relevantDocs = await retrieve(retrievalQuery, 5);
  const ragContext = formatContext(relevantDocs);

  const PLAN_SYSTEM_PROMPT = `You are a JSON-only fitness plan generator. You MUST respond with a single valid JSON object and absolutely nothing else — no preamble, no explanation, no markdown fences, no comments. The response must be parseable by JSON.parse() without any preprocessing.

Generate a detailed 2-week training plan (the first 2 weeks of an 8-week program) based on the user profile provided.

Return EXACTLY this JSON structure:
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
          "type": "strength" | "cardio" | "conditioning" | "rest" | "mobility",
          "focus": string,
          "durationMinutes": number,
          "exercises": [
            { "name": string, "sets": number, "reps": string, "weight": string, "notes": string }
          ],
          "coachTip": string
        }
      ]
    }
  ]
}

Rules:
- weeks array must contain exactly 2 objects (weekNumber 1 and 2)
- Each week's days array must contain exactly 7 objects in order: Mon, Tue, Wed, Thu, Fri, Sat, Sun
- Rest/mobility days must have durationMinutes: 0 and exercises: []
- Strength and conditioning days must have 4-6 exercises each
- reps can be strings like "6", "8-10", "AMRAP", "60 sec", "10 each side"
- weight: use "BW" for bodyweight, "Light" or "Moderate" for relative load, "RPE 7" for autoregulation, or specific lbs if appropriate
- coachTip must be non-empty for every day including rest days
- programSummary must describe the full 8-week arc
- generatedAt must be a valid ISO 8601 timestamp
- Calibrate everything precisely to the user's experience level, equipment, injuries, and schedule`;

  const profileSummary = `User Profile:
- Athlete identity: ${userProfile.athleteIdentity ?? 'Not specified'}
- Goals: ${userProfile.goals ?? 'Not specified'}
- Schedule: ${userProfile.schedule ?? 'Not specified'}
- Injuries/limitations: ${userProfile.injuries ?? 'None reported'}
- Nutrition: ${userProfile.nutrition ?? 'Not specified'}

Full onboarding conversation:
${conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'APEX'}: ${m.content}`).join('\n\n')}

Generate the training plan JSON now.`;

  const systemWithContext = ragContext
    ? `${PLAN_SYSTEM_PROMPT}\n\nRelevant fitness knowledge:\n${ragContext}`
    : PLAN_SYSTEM_PROMPT;

  const authReq2 = req as AuthRequest;
  if (!(await checkCredits(authReq2.userId!))) {
    return res.status(402).json({ error: 'out_of_credits', message: 'You have used all your free credits. Please add more to continue.' });
  }

  try {
    const model = 'claude-haiku-4-5';
    const response = await anthropic.messages.create({
      model,
      max_tokens: 8000,
      system: systemWithContext,
      messages: [{ role: 'user', content: profileSummary }],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    // Strip markdown code fences Claude sometimes adds despite instructions
    const jsonText = rawText
      .replace(/^```(?:json)?[\r\n]*/i, '')
      .replace(/[\r\n]*```\s*$/i, '')
      .trim();

    let plan;
    try {
      plan = JSON.parse(jsonText);
    } catch {
      console.error('Plan JSON parse failed:', rawText.slice(0, 500));
      return res.status(500).json({ error: 'Plan generation produced invalid JSON. Please retry.' });
    }

    if (!plan.generatedAt || plan.generatedAt.includes('<') || plan.generatedAt.includes('ISO')) {
      plan.generatedAt = new Date().toISOString();
    }

    const planCost = calcCost(model, response.usage.input_tokens, response.usage.output_tokens);
    await deductCredits(authReq2.userId!, planCost);

    // Auto-save to MongoDB
    await Plan.findOneAndUpdate(
      { userId: authReq2.userId },
      { userId: authReq2.userId, ...plan },
      { upsert: true, new: true }
    );
    await Progress.findOneAndUpdate(
      { userId: authReq2.userId },
      { userId: authReq.userId, completedDays: [] },
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
  const { messages, userProfile } = req.body as {
    messages: Message[];
    userProfile?: Record<string, string>;
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
  const systemWithContext = ragContext
    ? `${SYSTEM_PROMPT}\n\n─── RELEVANT FITNESS KNOWLEDGE (retrieved for this query) ───\n${ragContext}\n─────────────────────────────────────────────────────────`
    : SYSTEM_PROMPT;

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
