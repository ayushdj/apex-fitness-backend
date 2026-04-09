from fastapi import APIRouter

from services.auth_service import register, login

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def api_register(body: dict):
    return await register(body)


@router.post("/login")
async def api_login(body: dict):
    return await login(body)
