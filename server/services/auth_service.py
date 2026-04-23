import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException, Header
from jose import JWTError, jwt
from passlib.context import CryptContext

import db

SECRET = os.getenv("JWT_SECRET", "changeme")
ALGORITHM = "HS256"
EXPIRES_DAYS = 30

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_ctx.verify(plain, hashed)


def create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=EXPIRES_DAYS)
    return jwt.encode(
        {"userId": user_id, "email": email, "exp": expire},
        SECRET,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None


async def require_auth(authorization: Optional[str] = Header(None)) -> str:
    """FastAPI dependency — extracts and validates the Bearer JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    payload = decode_token(authorization[7:])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["userId"]


async def register(body: dict) -> dict:
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="name, email and password are required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if await db.users().find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    result = await db.users().insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password),
        "credits": 5.00,
        "creditsUsed": 0.00,
    })
    user_id = str(result.inserted_id)
    token = create_token(user_id, email)
    return {"token": token, "user": {"id": user_id, "name": name, "email": email}}


async def login(body: dict) -> dict:
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        raise HTTPException(status_code=400, detail="email and password are required")

    user = await db.users().find_one({"email": email})
    if not user or not verify_password(password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_token(user_id, email)
    return {
        "token": token,
        "user": {"id": user_id, "name": user["name"], "email": user["email"]},
    }


async def change_password(user_id: str, body: dict) -> dict:
    """Authenticated — requires current password + new password."""
    current_password = body.get("currentPassword") or ""
    new_password = body.get("newPassword") or ""

    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="currentPassword and newPassword are required")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    user = await db.users().find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(current_password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    await db.users().update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hash_password(new_password)}},
    )
    return {"message": "Password updated successfully"}


async def forgot_password(body: dict) -> dict:
    """Generates a short-lived reset token for the given email.
    In production, email this token to the user. For now it is returned
    in the response so you can use it directly with /reset-password."""
    email = (body.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="email is required")

    user = await db.users().find_one({"email": email})
    # Always return 200 to avoid leaking whether the email exists
    if not user:
        return {"message": "If that email exists you will receive a reset token"}

    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.users().update_one(
        {"_id": user["_id"]},
        {"$set": {"resetToken": reset_token, "resetTokenExpires": expires_at}},
    )

    # TODO: replace with email delivery (SendGrid / SES / Resend)
    print(f"[RESET TOKEN] email={email} token={reset_token}")

    return {
        "message": "Reset token generated",
        "resetToken": reset_token,   # remove this line once email is wired up
    }


async def reset_password(body: dict) -> dict:
    """Validates the reset token and sets a new password."""
    token = (body.get("resetToken") or "").strip()
    new_password = body.get("newPassword") or ""

    if not token or not new_password:
        raise HTTPException(status_code=400, detail="resetToken and newPassword are required")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    user = await db.users().find_one({"resetToken": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    expires_at = user.get("resetTokenExpires")
    if expires_at and datetime.now(timezone.utc) > expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    await db.users().update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": hash_password(new_password)},
            "$unset": {"resetToken": "", "resetTokenExpires": ""},
        },
    )
    return {"message": "Password reset successfully"}
