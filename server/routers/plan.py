from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

import db
from services.auth_service import require_auth
from services.plan_service import generate_plan
from utils import serialize_doc

router = APIRouter(prefix="/api/plan", tags=["plan"])


@router.post("/generate")
async def api_plan_generate(body: dict, user_id: str = Depends(require_auth)):
    user_profile = body.get("userProfile", {})
    conversation_history = body.get("conversationHistory", [])

    if not user_profile:
        raise HTTPException(status_code=400, detail="userProfile required")
    # conversationHistory may be empty when using Quick Setup — that is valid

    plan = await generate_plan(user_id, user_profile, conversation_history)
    return {"plan": plan}


@router.post("")
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


@router.get("")
async def api_plan_get(user_id: str = Depends(require_auth)):
    plan = await db.plans().find_one({"userId": ObjectId(user_id)})
    return {"plan": serialize_doc(plan)}


@router.delete("")
async def api_plan_delete(user_id: str = Depends(require_auth)):
    oid = ObjectId(user_id)
    await db.plans().delete_one({"userId": oid})
    await db.progress().delete_one({"userId": oid})
    return {"ok": True}
