"""OEI Assessment schemas."""
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class DimensionInput(BaseModel):
    """Input for a single OEI dimension during scoring."""
    dimension: str
    raw_score: float = Field(ge=0, le=100)


class AssessmentCreate(BaseModel):
    """
    Request body to create + score an assessment.
    Provide one DimensionInput per OEI dimension.
    """
    project_id: uuid.UUID
    dimensions: List[DimensionInput] = Field(min_length=6, max_length=6)
    notes: Optional[str] = None


class DimensionScoreRead(BaseModel):
    id: uuid.UUID
    dimension: str
    raw_score: float
    weight: float
    weighted_score: float

    model_config = {"from_attributes": True}


class AssessmentRead(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    assessed_by_id: Optional[uuid.UUID]
    total_score: float
    level: str
    score_version: str
    notes: Optional[str]
    is_published: bool
    dimension_scores: List[DimensionScoreRead]
    created_at: datetime

    model_config = {"from_attributes": True}
