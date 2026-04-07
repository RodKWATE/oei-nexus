"""Project model — energy project tracked on the platform."""
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.assessment import OeiAssessment
    from app.models.metric import ImpactMetric
    from app.models.organization import Organization
    from app.models.user import User


class Project(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "projects"

    # ── Identity ──────────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    cover_image_url: Mapped[Optional[str]] = mapped_column(Text)

    # ── Classification ────────────────────────────────────────────────────────
    project_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # types: solar | wind | hydro | biomass | geothermal | hybrid | efficiency | storage

    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)
    # statuses: draft | active | completed | archived

    # ── Geography ─────────────────────────────────────────────────────────────
    country: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    region: Mapped[Optional[str]] = mapped_column(String(100))
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)

    # ── Scale ─────────────────────────────────────────────────────────────────
    capacity_mw: Mapped[Optional[float]] = mapped_column(Float)
    investment_usd: Mapped[Optional[float]] = mapped_column(Float)
    beneficiaries: Mapped[Optional[int]] = mapped_column(Integer)

    # ── OEI score cache (denormalized for fast reads) ─────────────────────────
    oei_score: Mapped[Optional[float]] = mapped_column(Float, index=True)
    oei_level: Mapped[Optional[str]] = mapped_column(String(20))
    # levels: Bronze | Silver | Gold | Platinum

    # ── FK ────────────────────────────────────────────────────────────────────
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("organizations.id", ondelete="SET NULL"), index=True
    )
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    organization: Mapped[Optional["Organization"]] = relationship(
        "Organization", back_populates="projects"
    )
    created_by: Mapped[Optional["User"]] = relationship(
        "User", back_populates="projects", foreign_keys=[created_by_id]
    )
    assessments: Mapped[List["OeiAssessment"]] = relationship(
        "OeiAssessment", back_populates="project", cascade="all, delete-orphan"
    )
    metrics: Mapped[List["ImpactMetric"]] = relationship(
        "ImpactMetric", back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Project {self.name} ({self.status})>"
