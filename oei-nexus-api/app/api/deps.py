"""
FastAPI dependencies:
  - get_current_user         — JWT Bearer → User (raises 401 if invalid)
  - get_current_active_user  — user must be active
  - require_superuser        — user must be superuser
"""
import uuid

import structlog
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import (
    AuthorizationError,
    InactiveAccountError,
    InvalidTokenError,
    UserNotFoundError,
)
from app.core.security import decode_token
from app.models.user import User
from app.repositories.user_repo import UserRepository

logger = structlog.get_logger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise InvalidTokenError("Missing Bearer token")

    token = credentials.credentials
    try:
        payload = decode_token(token)
    except JWTError as exc:
        logger.warning("token_decode_failed", error=str(exc))
        raise InvalidTokenError("Could not validate credentials") from exc

    user_id: str | None = payload.get("sub")
    token_type: str | None = payload.get("type")

    if token_type != "access" or not user_id:
        raise InvalidTokenError("Invalid token type or missing subject")

    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise InvalidTokenError("Malformed user ID in token")

    repo = UserRepository(db)
    user = await repo.get(uid)
    if not user:
        raise UserNotFoundError()

    return user


async def get_current_active_user(
    user: User = Depends(get_current_user),
) -> User:
    if not user.is_active:
        raise InactiveAccountError()
    return user


async def require_superuser(
    user: User = Depends(get_current_active_user),
) -> User:
    if not user.is_superuser:
        raise AuthorizationError("Superuser privileges required")
    return user
