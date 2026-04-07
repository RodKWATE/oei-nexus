"""Organization model — entity grouping users and projects."""
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User


class Organization(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    logo_url: Mapped[Optional[str]] = mapped_column(Text)
    website: Mapped[Optional[str]] = mapped_column(String(255))
    country: Mapped[Optional[str]] = mapped_column(String(100))

    org_type: Mapped[str] = mapped_column(String(50), default="ngo", nullable=False)
    # org_types: ngo | government | private | research | multilateral

    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    members: Mapped[List["User"]] = relationship("User", back_populates="organization")
    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="organization"
    )

    def __repr__(self) -> str:
        return f"<Organization {self.name}>"
