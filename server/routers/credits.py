from fastapi import APIRouter, Depends

from services.auth_service import require_auth
from services.credit_service import get_balance
from services.rag_service import get_stats

router = APIRouter(tags=["credits"])


@router.get("/api/credits")
async def api_credits(user_id: str = Depends(require_auth)):
    return await get_balance(user_id)


@router.get("/api/stats")
async def api_stats():
    return get_stats()
