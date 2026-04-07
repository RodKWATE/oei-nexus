"""User model — authentication + profile."""
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.project import Project


class User(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    avatar_url: Mapped[Optional[str]] = mapped_column(Text)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    country: Mapped[Optional[str]] = mapped_column(String(100))

    role: Mapped[str] = mapped_column(String(50), default="analyst", nullable=False)
    # roles: admin | analyst | investor | partner

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("organizations.id", ondelete="SET NULL"), index=True
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    organization: Mapped[Optional["Organization"]] = relationship(
        "Organization", back_populates="members"
    )
    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="created_by", foreign_keys="Project.created_by_id"
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
