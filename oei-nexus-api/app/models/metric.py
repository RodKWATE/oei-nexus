"""ImpactMetric model — time-series KPI records for a project."""
import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKey

if TYPE_CHECKING:
    from app.models.project import Project


class ImpactMetric(UUIDPrimaryKey, TimestampMixin, Base):
    """
    A single KPI data point attached to a project.
    Examples: co2_avoided_tonnes, households_connected, jobs_created
    """
    __tablename__ = "impact_metrics"

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )

    metric_key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    # e.g. "co2_avoided_tonnes" | "households_connected" | "jobs_created"

    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    period_date: Mapped[Optional[date]] = mapped_column(Date, index=True)

    source: Mapped[Optional[str]] = mapped_column(String(255))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # ── Relationships ─────────────────────────────────────────────────────────
    project: Mapped["Project"] = relationship("Project", back_populates="metrics")

    def __repr__(self) -> str:
        return f"<ImpactMetric {self.metric_key}={self.value} {self.unit}>"
