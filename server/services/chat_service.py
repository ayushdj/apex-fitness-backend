import os
from typing import AsyncIterator

import anthropic

from services.credit_service import calc_cost, check_credits, deduct_credits
from services.rag_service import retrieve, format_context

_claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are APEX, an elite AI fitness coach. You communicate like a knowledgeable, encouraging personal trainer — direct, practical, science-backed, and warm.

Your role is to:
1. During onboarding: ask targeted questions to understand the user's athlete identity, goals, schedule, equipment, and constraints
2. Generate personalized, periodized training plans with real exercises, sets, reps, and progressions
3. Provide evidence-based nutrition guidance tailored to their goals
4. Adjust plans based on feedback, recovery data, or goal changes
5. Explain the "why" behind recommendations

Scope rules (strictly enforced):
- You ONLY answer questions related to fitness, exercise, training, nutrition, diet, recovery, sleep, and physical health.
- If the user asks about ANYTHING outside these topics — politics, coding, relationships, general knowledge, entertainment, finance, or any other unrelated subject — respond with exactly this and nothing more:
  "I'm APEX, your fitness coach — I can only help with training, nutrition, and health topics. What fitness goal can I help you with today?"
- Do not apologise excessively. Do not engage with the off-topic subject at all. Just redirect once, clearly.
- Borderline topics like mental health as it relates to exercise, sleep quality, or stress management ARE within scope.

Style rules:
- Be conversational, not clinical. Sound like a coach, not a textbook.
- Use specific exercise names and rep schemes, not vague guidance.
- When the user describes a goal in natural language ("I want to feel more athletic"), translate it into concrete training variables.
- Reference the provided fitness knowledge when relevant, but synthesize it naturally — don't just quote it verbatim.
- Keep responses focused and actionable. Avoid unnecessary disclaimers.
- For safety: note if exercises should be progressed carefully, but don't add excessive medical disclaimers."""


def _build_system(rag_ctx: str = "", plan_context: str = "") -> str:
    parts = [SYSTEM_PROMPT]
    if plan_context:
        parts.append(
            f"\n\n─── USER'S CURRENT TRAINING PLAN ───\n{plan_context}\n──────────────────────────────────────────────────────────"
        )
    if rag_ctx:
        parts.append(
            f"\n\n─── RELEVANT FITNESS KNOWLEDGE (retrieved for this query) ───\n{rag_ctx}\n──────────────────────────────────────────────────────────"
        )
    return "".join(parts)


OFF_TOPIC_REPLY = "I'm APEX, your fitness coach — I can only help with training, nutrition, and health topics. What fitness goal can I help you with today?"

# Minimum cosine similarity for a query to be considered fitness-related.
# Scores below this threshold mean the query has no meaningful match in the
# fitness/nutrition knowledge base and is almost certainly off-topic.
RAG_RELEVANCE_THRESHOLD = 0.25


async def _build_rag_context(messages: list[dict], user_profile: dict) -> tuple[str, bool]:
    """Returns (rag_context, is_on_topic)."""
    latest = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
    profile_ctx = ", ".join(f"{k}: {v}" for k, v in (user_profile or {}).items())
    docs = await retrieve(f"{latest} {profile_ctx}", n_results=8)

    # If the best-matching doc scores below the threshold the query is off-topic
    if docs and docs[0]["score"] < RAG_RELEVANCE_THRESHOLD:
        return "", False

    return format_context(docs), True


async def stream_chat(
    messages: list[dict],
    user_profile: dict,
) -> AsyncIterator[str]:
    """Yields SSE-formatted data strings for the streaming chat endpoint."""
    rag_ctx, on_topic = await _build_rag_context(messages, user_profile)

    if not on_topic:
        yield f"data: {{'text': {repr(OFF_TOPIC_REPLY)}}}\n\n"
        yield "data: [DONE]\n\n"
        return

    system = _build_system(rag_ctx=rag_ctx)

    try:
        with _claude.messages.stream(
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


async def complete_chat(
    user_id: str,
    messages: list[dict],
    user_profile: dict,
    plan_context: str = "",
) -> str:
    """Non-streaming chat completion. Returns the assistant reply text."""
    from fastapi import HTTPException

    if not await check_credits(user_id):
        raise HTTPException(
            status_code=402,
            detail={"error": "out_of_credits", "message": "You have used all your free credits."},
        )

    rag_ctx, on_topic = await _build_rag_context(messages, user_profile)

    # Return the off-topic reply without consuming credits
    if not on_topic:
        return OFF_TOPIC_REPLY

    system = _build_system(rag_ctx=rag_ctx, plan_context=plan_context)

    model = "claude-opus-4-6"
    import asyncio
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: _claude.messages.create(
            model=model,
            max_tokens=1024,
            system=system,
            messages=[{"role": m["role"], "content": m["content"]} for m in messages],
        ),
    )

    text = response.content[0].text if response.content and response.content[0].type == "text" else ""
    cost = calc_cost(model, response.usage.input_tokens, response.usage.output_tokens)
    await deduct_credits(user_id, cost)
    return text
