"""Auth routes: register, login, refresh, me."""
import structlog
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.token import RefreshRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import (
    authenticate_user,
    issue_tokens,
    refresh_tokens,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])
logger = structlog.get_logger(__name__)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await register_user(data, db)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user = await authenticate_user(form_data.username, form_data.password, db)
    return issue_tokens(user)


@router.post("/refresh", response_model=Token)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    return await refresh_tokens(data.refresh_token, db)


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_active_user)):
    return current_user
