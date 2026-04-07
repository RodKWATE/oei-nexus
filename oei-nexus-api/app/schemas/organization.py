"""Organization schemas."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class OrganizationCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    org_type: str = "ngo"

    @field_validator("org_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"ngo", "government", "private", "research", "multilateral"}
        if v not in allowed:
            raise ValueError(f"org_type must be one of {allowed}")
        return v


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    org_type: Optional[str] = None
    is_active: Optional[bool] = None


class OrganizationRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str]
    logo_url: Optional[str]
    website: Optional[str]
    country: Optional[str]
    org_type: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
