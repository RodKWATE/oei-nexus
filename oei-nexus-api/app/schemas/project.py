"""Project schemas."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ProjectCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    project_type: str
    country: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    capacity_mw: Optional[float] = Field(None, gt=0)
    investment_usd: Optional[float] = Field(None, gt=0)
    beneficiaries: Optional[int] = Field(None, gt=0)
    organization_id: Optional[uuid.UUID] = None

    @field_validator("project_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"solar", "wind", "hydro", "biomass", "geothermal", "hybrid", "efficiency", "storage"}
        if v not in allowed:
            raise ValueError(f"project_type must be one of {allowed}")
        return v


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    project_type: Optional[str] = None
    status: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_mw: Optional[float] = None
    investment_usd: Optional[float] = None
    beneficiaries: Optional[int] = None


class ProjectRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str]
    project_type: str
    status: str
    country: Optional[str]
    region: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    capacity_mw: Optional[float]
    investment_usd: Optional[float]
    beneficiaries: Optional[int]
    oei_score: Optional[float]
    oei_level: Optional[str]
    organization_id: Optional[uuid.UUID]
    created_by_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectSummary(BaseModel):
    """Lightweight schema for list/map endpoints."""
    id: uuid.UUID
    name: str
    project_type: str
    status: str
    country: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    oei_score: Optional[float]
    oei_level: Optional[str]

    model_config = {"from_attributes": True}
