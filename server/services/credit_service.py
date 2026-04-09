from bson import ObjectId
from fastapi import HTTPException

import db

PRICING = {
    "claude-opus-4-6":  {"input": 15.00, "output": 75.00},
    "claude-haiku-4-5": {"input": 0.80,  "output": 4.00},
}


def calc_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    p = PRICING.get(model, PRICING["claude-opus-4-6"])
    return (input_tokens * p["input"] + output_tokens * p["output"]) / 1_000_000


async def check_credits(user_id: str) -> bool:
    """Returns True if the user has credits remaining. Initialises legacy users to $5."""
    user = await db.users().find_one({"_id": ObjectId(user_id)}, {"credits": 1})
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


async def get_balance(user_id: str) -> dict:
    user = await db.users().find_one(
        {"_id": ObjectId(user_id)}, {"credits": 1, "creditsUsed": 1}
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "credits": round(max(0.0, user.get("credits", 0) or 0), 4),
        "creditsUsed": round(user.get("creditsUsed", 0) or 0, 4),
    }
