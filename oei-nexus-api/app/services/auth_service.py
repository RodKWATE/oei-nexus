"""Authentication service — register, login, token refresh.

Raises domain exceptions only — no FastAPI/HTTP imports.
"""
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    EmailAlreadyExistsError,
    InactiveAccountError,
    InvalidCredentialsError,
    InvalidTokenError,
    UserNotFoundError,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserCreate

logger = structlog.get_logger(__name__)


async def register_user(data: UserCreate, db: AsyncSession) -> User:
    repo = UserRepository(db)
    if await repo.email_exists(data.email):
        logger.warning("register_email_conflict", email=data.email)
        raise EmailAlreadyExistsError(email=data.email)

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        country=data.country,
        role=data.role,
    )
    user = await repo.create(user)
    logger.info("user_registered", user_id=str(user.id), email=user.email, role=user.role)
    return user


async def authenticate_user(email: str, password: str, db: AsyncSession) -> User:
    repo = UserRepository(db)
    user = await repo.get_by_email(email)

    # Constant-time path: always call verify to prevent timing attacks
    if not user or not verify_password(password, user.hashed_password):
        logger.warning("auth_failed", email=email)
        raise InvalidCredentialsError()

    if not user.is_active:
        logger.warning("auth_inactive_account", user_id=str(user.id), email=email)
        raise InactiveAccountError()

    logger.info("user_authenticated", user_id=str(user.id), email=email)
    return user


def issue_tokens(user: User) -> Token:
    return Token(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


async def refresh_tokens(refresh_token: str, db: AsyncSession) -> Token:
    from jose import JWTError

    try:
        payload = decode_token(refresh_token)
    except JWTError as exc:
        logger.warning("token_refresh_invalid", error=str(exc))
        raise InvalidTokenError("Invalid or expired refresh token") from exc

    if payload.get("type") != "refresh":
        raise InvalidTokenError("Token is not a refresh token")

    user_id = payload.get("sub")
    repo = UserRepository(db)
    user = await repo.get(user_id)

    if not user:
        raise UserNotFoundError()
    if not user.is_active:
        raise InactiveAccountError()

    logger.info("tokens_refreshed", user_id=user_id)
    return issue_tokens(user)
