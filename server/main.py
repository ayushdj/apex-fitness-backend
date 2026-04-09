import asyncio
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

import anthropic
from bson import ObjectId
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn

import db
from auth import require_auth, register, login
from rag import build_index, retrieve, format_context, get_stats

# ── Credit pricing (USD per million tokens) ──────────────────────────────────
PRICING = {
    "claude-opus-4-6":  {"input": 15.00, "output": 75.00},
    "claude-haiku-4-5": {"input": 0.80,  "output": 4.00},
}


def calc_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    p = PRICING.get(model, PRICING["claude-opus-4-6"])
    return (input_tokens * p["input"] + output_tokens * p["output"]) / 1_000_000


async def check_credits(user_id: str) -> bool:
    user = await db.users().find_one({"_id": ObjectId(user_id)}, {"credits": 1, "creditsUsed": 1})
    if not user:
        return False
    credits = user.get("credits")
    if credits is None:
        await db.users().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"credits": 5.00, "creditsUsed": 0.00}},
        )
        return True
    return credits > 0


async def deduct_credits(user_id: str, cost: float) -> None:
    await db.users().update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"credits": -cost, "creditsUsed": cost}},
    )


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect_db()
    await build_index()
    stats = get_stats()
    print(f"✓ RAG index ready: {stats['totalDocs']} documents")
    yield


# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are APEX, an elite AI fitness coach. You communicate like a knowledgeable, encouraging personal trainer — direct, practical, science-backed, and warm.

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

You have access to a database of evidence-based training and nutrition knowledge. Use this to give specific, accurate recommendations."""

TRAINING_PROMPT = """You are a JSON-only training plan generator. Respond with a single valid JSON object only — no markdown, no explanation.

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
- Calibrate precisely to experience level, equipment, injuries, schedule"""

MEAL_PROMPT = """You are a JSON-only nutrition planner. Respond with a single valid JSON object only — no markdown, no explanation.

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
- ALL recommendations must strictly respect dietary restrictions"""


def strip_fences(raw: str) -> str:
    import re
    return re.sub(r'^```(?:json)?[\r\n]*', '', raw, flags=re.IGNORECASE).rstrip().rstrip('`').strip()


def serialize_doc(doc: dict) -> dict:
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "userId" in doc:
        doc["userId"] = str(doc["userId"])
    return doc


# ── Auth routes ───────────────────────────────────────────────────────────────

@app.post("/api/auth/register")
async def api_register(body: dict):
    return await register(body)


@app.post("/api/auth/login")
async def api_login(body: dict):
    return await login(body)


# ── Chat (streaming SSE) ──────────────────────────────────────────────────────

@app.post("/api/chat")
async def api_chat(body: dict, user_id: str = Depends(require_auth)):
    messages = body.get("messages", [])
    user_profile = body.get("userProfile", {})

    if not messages:
        raise HTTPException(status_code=400, detail="messages required")

    latest = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    profile_ctx = ", ".join(f"{k}: {v}" for k, v in (user_profile or {}).items())
    query = f"{latest} {profile_ctx}"

    docs = await retrieve(query, 8)
    rag_ctx = format_context(docs)

    system = SYSTEM_PROMPT
    if rag_ctx:
        system += f"\n\n─── RELEVANT FITNESS KNOWLEDGE ───\n{rag_ctx}\n──────────────────────────────────"

    async def event_stream():
        try:
            with claude.messages.stream(
                model="claude-opus-4-6",
                max_tokens=1024,
                system=system,
                messages=[{"role": m["role"], "content": m["content"]} for m in messages],
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {{'text': {repr(text)}}}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {{'error': {repr(str(e))}}}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ── Plan generation ───────────────────────────────────────────────────────────

@app.post("/api/plan/generate")
async def api_plan_generate(body: dict, user_id: str = Depends(require_auth)):
    user_profile = body.get("userProfile", {})
    conversation_history = body.get("conversationHistory", [])

    if not user_profile or not conversation_history:
        raise HTTPException(status_code=400, detail="userProfile and conversationHistory required")

    if not await check_credits(user_id):
        raise HTTPException(
            status_code=402,
            detail={"error": "out_of_credits", "message": "You have used all your free credits."},
        )

    query = " ".join(filter(None, [
        user_profile.get("athleteIdentity"),
        user_profile.get("goals"),
        user_profile.get("schedule"),
        user_profile.get("diet"),
        "training plan programming periodization progressive overload nutrition meal plan",
    ]))

    docs = await retrieve(query, 10)
    rag_ctx = format_context(docs)

    training_system = TRAINING_PROMPT + (f"\n\nRelevant fitness knowledge:\n{rag_ctx}" if rag_ctx else "")
    meal_system = MEAL_PROMPT + (f"\n\nRelevant nutrition knowledge:\n{rag_ctx}" if rag_ctx else "")

    profile_summary = f"""User Profile:
- Athlete identity: {user_profile.get('athleteIdentity', 'Not specified')}
- Goals: {user_profile.get('goals', 'Not specified')}
- Schedule: {user_profile.get('schedule', 'Not specified')}
- Injuries/limitations: {user_profile.get('injuries', 'None reported')}
- Diet / food preferences: {user_profile.get('diet', user_profile.get('nutrition', 'Not specified'))}

Full onboarding conversation:
{chr(10).join(f"{'User' if m['role'] == 'user' else 'APEX'}: {m['content']}" for m in conversation_history)}"""

    model = "claude-haiku-4-5"

    async def gen_training():
        return claude.messages.create(
            model=model,
            max_tokens=8000,
            system=training_system,
            messages=[{"role": "user", "content": f"{profile_summary}\n\nGenerate the training plan JSON now."}],
        )

    async def gen_meal():
        return claude.messages.create(
            model=model,
            max_tokens=2000,
            system=meal_system,
            messages=[{"role": "user", "content": f"{profile_summary}\n\nGenerate the meal plan JSON now."}],
        )

    loop = asyncio.get_event_loop()
    training_res, meal_res = await asyncio.gather(
        loop.run_in_executor(None, lambda: claude.messages.create(
            model=model,
            max_tokens=8000,
            system=training_system,
            messages=[{"role": "user", "content": f"{profile_summary}\n\nGenerate the training plan JSON now."}],
        )),
        loop.run_in_executor(None, lambda: claude.messages.create(
            model=model,
            max_tokens=2000,
            system=meal_system,
            messages=[{"role": "user", "content": f"{profile_summary}\n\nGenerate the meal plan JSON now."}],
        )),
    )

    import json
    from datetime import datetime, timezone

    def parse_json(res, label: str):
        raw = res.content[0].text if res.content and res.content[0].type == "text" else ""
        text = strip_fences(raw)
        try:
            return json.loads(text)
        except Exception:
            print(f"{label} JSON parse failed: {raw[:300]}")
            return None

    plan = parse_json(training_res, "Training plan")
    if not plan:
        raise HTTPException(status_code=500, detail="Plan generation produced invalid JSON. Please retry.")

    meal_plan = parse_json(meal_res, "Meal plan")
    if meal_plan:
        plan["mealPlan"] = meal_plan

    if not plan.get("generatedAt") or "<" in str(plan.get("generatedAt", "")) or "ISO" in str(plan.get("generatedAt", "")):
        plan["generatedAt"] = datetime.now(timezone.utc).isoformat()

    total_cost = (
        calc_cost(model, training_res.usage.input_tokens, training_res.usage.output_tokens) +
        calc_cost(model, meal_res.usage.input_tokens, meal_res.usage.output_tokens)
    )
    await deduct_credits(user_id, total_cost)

    # Auto-save to MongoDB
    oid = ObjectId(user_id)
    await db.plans().find_one_and_update(
        {"userId": oid},
        {"$set": {"userId": oid, **{k: v for k, v in plan.items() if k != "userId"}}},
        upsert=True,
    )
    await db.progress().find_one_and_update(
        {"userId": oid},
        {"$setOnInsert": {"userId": oid, "completedDays": []}},
        upsert=True,
    )

    return {"plan": plan}


# ── Chat complete (non-streaming) ─────────────────────────────────────────────

@app.post("/api/chat/complete")
async def api_chat_complete(body: dict, user_id: str = Depends(require_auth)):
    messages = body.get("messages", [])
    user_profile = body.get("userProfile", {})
    plan_context = body.get("planContext", "")

    if not messages:
        raise HTTPException(status_code=400, detail="messages required")

    if not await check_credits(user_id):
        raise HTTPException(
            status_code=402,
            detail={"error": "out_of_credits", "message": "You have used all your free credits."},
        )

    latest = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    profile_ctx = ", ".join(f"{k}: {v}" for k, v in (user_profile or {}).items())
    query = f"{latest} {profile_ctx}"

    docs = await retrieve(query, 8)
    rag_ctx = format_context(docs)

    system_parts = [SYSTEM_PROMPT]
    if plan_context:
        system_parts.append(f"\n\n─── USER'S CURRENT TRAINING PLAN ───\n{plan_context}\n──────────────────────────────────────────────────────────")
    if rag_ctx:
        system_parts.append(f"\n\n─── RELEVANT FITNESS KNOWLEDGE (retrieved for this query) ───\n{rag_ctx}\n──────────────────────────────────────────────────────────")
    system = "".join(system_parts)

    model = "claude-opus-4-6"
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, lambda: claude.messages.create(
        model=model,
        max_tokens=1024,
        system=system,
        messages=[{"role": m["role"], "content": m["content"]} for m in messages],
    ))

    text = response.content[0].text if response.content and response.content[0].type == "text" else ""
    cost = calc_cost(model, response.usage.input_tokens, response.usage.output_tokens)
    await deduct_credits(user_id, cost)

    return {"text": text}


# ── Credits ───────────────────────────────────────────────────────────────────

@app.get("/api/credits")
async def api_credits(user_id: str = Depends(require_auth)):
    user = await db.users().find_one({"_id": ObjectId(user_id)}, {"credits": 1, "creditsUsed": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    credits = user.get("credits", 0) or 0
    credits_used = user.get("creditsUsed", 0) or 0
    return {
        "credits": round(max(0.0, credits), 4),
        "creditsUsed": round(credits_used, 4),
    }


# ── Stats ─────────────────────────────────────────────────────────────────────

@app.get("/api/stats")
async def api_stats():
    return get_stats()


# ── Plan routes ───────────────────────────────────────────────────────────────

@app.post("/api/plan")
async def api_plan_save(body: dict, user_id: str = Depends(require_auth)):
    plan = body.get("plan")
    if not plan:
        raise HTTPException(status_code=400, detail="plan required")
    oid = ObjectId(user_id)
    saved = await db.plans().find_one_and_update(
        {"userId": oid},
        {"$set": {"userId": oid, **{k: v for k, v in plan.items() if k != "userId"}}},
        upsert=True,
        return_document=True,
    )
    return {"plan": serialize_doc(saved)}


@app.get("/api/plan")
async def api_plan_get(user_id: str = Depends(require_auth)):
    plan = await db.plans().find_one({"userId": ObjectId(user_id)})
    return {"plan": serialize_doc(plan)}


@app.delete("/api/plan")
async def api_plan_delete(user_id: str = Depends(require_auth)):
    oid = ObjectId(user_id)
    await db.plans().delete_one({"userId": oid})
    await db.progress().delete_one({"userId": oid})
    return {"ok": True}


# ── Progress routes ───────────────────────────────────────────────────────────

@app.get("/api/progress")
async def api_progress_get(user_id: str = Depends(require_auth)):
    prog = await db.progress().find_one({"userId": ObjectId(user_id)})
    return {"progress": serialize_doc(prog) or {"completedDays": []}}


@app.post("/api/progress/complete")
async def api_progress_complete(body: dict, user_id: str = Depends(require_auth)):
    day_key = body.get("dayKey")
    if not day_key:
        raise HTTPException(status_code=400, detail="dayKey required")
    oid = ObjectId(user_id)
    prog = await db.progress().find_one_and_update(
        {"userId": oid},
        {"$addToSet": {"completedDays": day_key}},
        upsert=True,
        return_document=True,
    )
    return {"progress": serialize_doc(prog)}


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", "3001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
