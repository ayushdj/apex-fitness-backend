from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from services.auth_service import require_auth
from services.chat_service import stream_chat, complete_chat

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("")
async def api_chat_stream(body: dict, user_id: str = Depends(require_auth)):
    """Streaming SSE chat endpoint."""
    messages = body.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="messages required")

    return StreamingResponse(
        stream_chat(messages, body.get("userProfile", {})),
        media_type="text/event-stream",
    )


@router.post("/complete")
async def api_chat_complete(body: dict, user_id: str = Depends(require_auth)):
    """Non-streaming chat completion for React Native."""
    messages = body.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="messages required")

    text = await complete_chat(
        user_id=user_id,
        messages=messages,
        user_profile=body.get("userProfile", {}),
        plan_context=body.get("planContext", ""),
    )
    return {"text": text}
