from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

import db
from services.auth_service import require_auth
from utils import serialize_doc

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("")
async def api_progress_get(user_id: str = Depends(require_auth)):
    prog = await db.progress().find_one({"userId": ObjectId(user_id)})
    return {"progress": serialize_doc(prog) or {"completedDays": []}}


@router.post("/complete")
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
