from fastapi import APIRouter, Depends

from services.auth_service import register, login, change_password, forgot_password, reset_password, require_auth

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def api_register(body: dict):
    return await register(body)


@router.post("/login")
async def api_login(body: dict):
    return await login(body)


@router.post("/change-password")
async def api_change_password(body: dict, user_id: str = Depends(require_auth)):
    return await change_password(user_id, body)


@router.post("/forgot-password")
async def api_forgot_password(body: dict):
    return await forgot_password(body)


@router.post("/reset-password")
async def api_reset_password(body: dict):
    return await reset_password(body)
