"""OEI Assessment and per-dimension score models."""
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User


class OeiAssessment(UUIDPrimaryKey, TimestampMixin, Base):
    """
    A complete OEI evaluation for a project at a point in time.
    Stores the aggregate score + per-dimension breakdown.
    """
    __tablename__ = "oei_assessments"

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assessed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )

    # ── Aggregate ─────────────────────────────────────────────────────────────
    total_score: Mapped[float] = mapped_column(Float, nullable=False)
    level: Mapped[str] = mapped_column(String(20), nullable=False)
    score_version: Mapped[str] = mapped_column(String(10), nullable=False, default="2.4")

    notes: Mapped[Optional[str]] = mapped_column(Text)
    is_published: Mapped[bool] = mapped_column(default=False, nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    project: Mapped["Project"] = relationship("Project", back_populates="assessments")
    assessed_by: Mapped[Optional["User"]] = relationship("User")
    dimension_scores: Mapped[List["OeiDimensionScore"]] = relationship(
        "OeiDimensionScore", back_populates="assessment", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<OeiAssessment project={self.project_id} score={self.total_score}>"


class OeiDimensionScore(UUIDPrimaryKey, TimestampMixin, Base):
    """
    One of the 6 OEI dimension scores within an assessment.
    Dimensions: digitalization | sdg7 | finance | inclusion | governance | impact
    """
    __tablename__ = "oei_dimension_scores"

    assessment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("oei_assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )

    dimension: Mapped[str] = mapped_column(String(50), nullable=False)
    raw_score: Mapped[float] = mapped_column(Float, nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    weighted_score: Mapped[float] = mapped_column(Float, nullable=False)

    # Per-dimension evidence / sub-criteria answers (JSON serialized)
    criteria_json: Mapped[Optional[str]] = mapped_column(Text)

    # ── Relationships ─────────────────────────────────────────────────────────
    assessment: Mapped["OeiAssessment"] = relationship(
        "OeiAssessment", back_populates="dimension_scores"
    )
