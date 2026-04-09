import os
from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None
_db = None


async def connect_db() -> None:
    global _client, _db
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI is not set")
    _client = AsyncIOMotorClient(uri)
    _db = _client["apex"]
    # Ping to verify connection
    await _db.command("ping")
    print("✓ Connected to MongoDB Atlas")


def users():
    return _db["users"]


def plans():
    return _db["plans"]


def progress():
    return _db["progresses"]
