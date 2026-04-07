"""User request/response schemas."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = None
    country: Optional[str] = None
    role: str = "analyst"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"admin", "analyst", "investor", "partner"}
        if v not in allowed:
            raise ValueError(f"role must be one of {allowed}")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    country: Optional[str]
    role: str
    is_active: bool
    is_superuser: bool
    is_verified: bool
    organization_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str
