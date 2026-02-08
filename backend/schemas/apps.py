"""
Pydantic schemas for Intelligent Apps
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class AppStatus(str, Enum):
    DRAFT = "Draft"
    DEPLOYED = "Deployed"
    ARCHIVED = "Archived"


class AppCreate(BaseModel):
    """Request schema for creating a new application"""
    name: str = Field(..., min_length=1, max_length=100, description="Application name")
    description: Optional[str] = Field(None, max_length=500, description="Application description")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Credit Memo Processor",
                "description": "AI-powered credit memo analysis and generation"
            }
        }


class AppUpdate(BaseModel):
    """Request schema for updating an application"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[AppStatus] = None


class AppResponse(BaseModel):
    """Response schema for a single application"""
    id: str = Field(..., description="Unique application identifier")
    name: str = Field(..., description="Application name")
    description: Optional[str] = Field(None, description="Application description")
    version: str = Field(..., description="Current version (semver)")
    status: AppStatus = Field(..., description="Application status")
    agent_count: int = Field(..., description="Number of agents in this app")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    created_by: Optional[str] = Field(None, description="User who created the app")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "app-123",
                "name": "Credit Memo Processor",
                "description": "AI-powered credit memo analysis",
                "version": "1.2.0",
                "status": "Deployed",
                "agent_count": 4,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-20T14:45:00Z",
                "created_by": "user@example.com"
            }
        }


class AppListResponse(BaseModel):
    """Response schema for listing applications"""
    items: List[AppResponse] = Field(..., description="List of applications")
    total: int = Field(..., description="Total count")
    page: int = Field(1, description="Current page")
    page_size: int = Field(20, description="Items per page")
