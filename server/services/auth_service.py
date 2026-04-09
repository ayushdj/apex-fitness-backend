import os
from datetime import datetime, timedelta, timezone
from typing import Optional

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
