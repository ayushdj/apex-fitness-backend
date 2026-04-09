import asyncio
import json
import os
from datetime import datetime, timezone

import anthropic
from bson import ObjectId
from fastapi import HTTPException

import db
from services.credit_service import calc_cost, check_credits, deduct_credits
from services.rag_service import retrieve, format_context
from utils import strip_fences

_claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

_TRAINING_PROMPT = """You are a JSON-only training plan generator. Respond with a single valid JSON object only — no markdown, no explanation.

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

_MEAL_PROMPT = """You are a JSON-only nutrition planner. Respond with a single valid JSON object only — no markdown, no explanation.

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


def _build_profile_summary(user_profile: dict, conversation_history: list[dict]) -> str:
    return (
        f"User Profile:\n"
        f"- Athlete identity: {user_profile.get('athleteIdentity', 'Not specified')}\n"
        f"- Goals: {user_profile.get('goals', 'Not specified')}\n"
        f"- Schedule: {user_profile.get('schedule', 'Not specified')}\n"
        f"- Injuries/limitations: {user_profile.get('injuries', 'None reported')}\n"
        f"- Diet / food preferences: {user_profile.get('diet', user_profile.get('nutrition', 'Not specified'))}\n\n"
        f"Full onboarding conversation:\n"
        + "\n\n".join(
            f"{'User' if m['role'] == 'user' else 'APEX'}: {m['content']}"
            for m in conversation_history
        )
    )


def _parse_json(res: anthropic.types.Message, label: str) -> dict | None:
    raw = res.content[0].text if res.content and res.content[0].type == "text" else ""
    try:
        return json.loads(strip_fences(raw))
    except Exception:
        print(f"{label} JSON parse failed: {raw[:300]}")
        return None


async def generate_plan(user_id: str, user_profile: dict, conversation_history: list[dict]) -> dict:
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

    docs = await retrieve(query, n_results=10)
    rag_ctx = format_context(docs)

    profile_summary = _build_profile_summary(user_profile, conversation_history)
    training_system = _TRAINING_PROMPT + (f"\n\nRelevant fitness knowledge:\n{rag_ctx}" if rag_ctx else "")
    meal_system = _MEAL_PROMPT + (f"\n\nRelevant nutrition knowledge:\n{rag_ctx}" if rag_ctx else "")

    model = "claude-haiku-4-5"
    loop = asyncio.get_event_loop()

    training_res, meal_res = await asyncio.gather(
        loop.run_in_executor(None, lambda: _claude.messages.create(
            model=model,
            max_tokens=8000,
            system=training_system,
            messages=[{"role": "user", "content": f"{profile_summary}\n\nGenerate the training plan JSON now."}],
        )),
        loop.run_in_executor(None, lambda: _claude.messages.create(
            model=model,
            max_tokens=2000,
            system=meal_system,
            messages=[{"role": "user", "content": f"{profile_summary}\n\nGenerate the meal plan JSON now."}],
        )),
    )

    plan = _parse_json(training_res, "Training plan")
    if not plan:
        raise HTTPException(status_code=500, detail="Plan generation produced invalid JSON. Please retry.")

    meal_plan = _parse_json(meal_res, "Meal plan")
    if meal_plan:
        plan["mealPlan"] = meal_plan

    generated_at = plan.get("generatedAt", "")
    if not generated_at or "<" in generated_at or "ISO" in generated_at:
        plan["generatedAt"] = datetime.now(timezone.utc).isoformat()

    total_cost = (
        calc_cost(model, training_res.usage.input_tokens, training_res.usage.output_tokens) +
        calc_cost(model, meal_res.usage.input_tokens, meal_res.usage.output_tokens)
    )
    await deduct_credits(user_id, total_cost)

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

    return plan
