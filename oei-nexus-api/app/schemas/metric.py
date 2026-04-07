"""Impact metric schemas."""
import uuid
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MetricCreate(BaseModel):
    project_id: uuid.UUID
    metric_key: str
    value: float
    unit: str
    period_date: Optional[date] = None
    source: Optional[str] = None
    notes: Optional[str] = None


class MetricRead(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    metric_key: str
    value: float
    unit: str
    period_date: Optional[date]
    source: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class MetricAggregate(BaseModel):
    """Aggregated KPI summary returned by the impact dashboard."""
    total_co2_avoided_tonnes: float = 0
    total_households_connected: int = 0
    total_jobs_created: int = 0
    total_investment_usd: float = 0
    projects_count: int = 0
    countries_count: int = 0
