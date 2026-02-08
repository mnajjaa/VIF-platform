"""
Pydantic schemas for AI Agents
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AgentType(str, Enum):
    EXTRACTOR = "Extractor"
    MAPPER = "Mapper"
    ANALYSIS = "Analysis"
    SUMMARIZER = "Summarizer"
    CUSTOM = "Custom"


class AgentTypeCategory(str, Enum):
    CORE_INTELLIGENCE = "Core Intelligence"
    FUNCTION = "Function"
    INDUSTRY = "Industry"


class AgentCategory(str, Enum):
    KNOWLEDGE_RAG = "Knowledge & RAG"
    REASONING_PLANNING = "Reasoning & Planning"
    FINANCE = "Finance"
    BANKING = "Banking"
    INSURANCE = "Insurance"
    DATA_PROCESSING = "Data Processing"
    DOCUMENT_ANALYSIS = "Document Analysis"
    COMMUNICATION = "Communication"


class ModelConfig(BaseModel):
    """Model configuration for an agent"""
    provider: str = Field(..., description="Model provider (e.g., azure-openai, openai)")
    model_id: str = Field(..., description="Model identifier")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: int = Field(4096, ge=1, le=128000, description="Maximum tokens")
    
    class Config:
        json_schema_extra = {
            "example": {
                "provider": "azure-openai",
                "model_id": "gpt-4o",
                "temperature": 0.7,
                "max_tokens": 4096
            }
        }


class PromptConfig(BaseModel):
    """Prompt configuration with MLflow URIs"""
    system_prompt_uri: Optional[str] = Field(
        None, 
        description="MLflow URI for system prompt (e.g., mlflow:/prompts/system-v1)"
    )
    task_prompt_uri: Optional[str] = Field(
        None,
        description="MLflow URI for task prompt"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "system_prompt_uri": "mlflow:/prompts/credit-memo-system@v2",
                "task_prompt_uri": "mlflow:/prompts/credit-memo-task@v1"
            }
        }


class SchemaConfig(BaseModel):
    """Input/Output schema configuration"""
    input_schema_uri: Optional[str] = Field(
        None,
        description="URI to input JSONSchema"
    )
    output_schema_uri: Optional[str] = Field(
        None,
        description="URI to output JSONSchema"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "input_schema_uri": "schemas/credit-memo-input.json",
                "output_schema_uri": "schemas/credit-memo-output.json"
            }
        }


class ToolConfig(BaseModel):
    """Tool configuration for an agent"""
    id: str = Field(..., description="Tool identifier")
    name: str = Field(..., description="Tool display name")
    enabled: bool = Field(True, description="Whether tool is enabled")
    is_deterministic: bool = Field(False, description="Whether tool is deterministic")
    has_side_effects: bool = Field(False, description="Whether tool has side effects")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "pdf-parser",
                "name": "PDF Parser",
                "enabled": True,
                "is_deterministic": True,
                "has_side_effects": False
            }
        }


class MemoryConfig(BaseModel):
    """Memory/context configuration"""
    enabled: bool = Field(False, description="Whether memory is enabled")
    type: str = Field("conversation", description="Memory type")
    max_tokens: int = Field(2000, description="Maximum context tokens")

    class Config:
        json_schema_extra = {
            "example": {
                "enabled": True,
                "type": "conversation",
                "max_tokens": 2000
            }
        }


class AgentConfigFull(BaseModel):
    """Complete agent configuration (for YAML export)"""
    model: ModelConfig
    prompts: PromptConfig
    schemas: SchemaConfig
    tools: List[ToolConfig] = Field(default_factory=list)
    memory: MemoryConfig = Field(default_factory=MemoryConfig)


class AgentCreate(BaseModel):
    """Request schema for creating a new agent"""
    name: str = Field(..., min_length=1, max_length=100, description="Agent name")
    type: AgentType = Field(..., description="Agent type")
    type_category: AgentTypeCategory = Field(..., description="Type category")
    category: AgentCategory = Field(..., description="Business category")
    description: Optional[str] = Field(None, max_length=500, description="Agent description")
    config: Optional[AgentConfigFull] = Field(None, description="Full agent configuration")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Credit Memo Analyzer",
                "type": "Analysis",
                "type_category": "Industry",
                "category": "Banking",
                "description": "Analyzes credit memos for risk assessment",
                "config": {
                    "model": {
                        "provider": "azure-openai",
                        "model_id": "gpt-4o",
                        "temperature": 0.3,
                        "max_tokens": 8192
                    },
                    "prompts": {
                        "system_prompt_uri": "mlflow:/prompts/credit-analysis-system@v1",
                        "task_prompt_uri": "mlflow:/prompts/credit-analysis-task@v1"
                    },
                    "schemas": {
                        "input_schema_uri": "schemas/credit-input.json",
                        "output_schema_uri": "schemas/credit-output.json"
                    },
                    "tools": [],
                    "memory": {"enabled": False, "type": "conversation", "max_tokens": 2000}
                }
            }
        }


class AgentUpdate(BaseModel):
    """Request schema for updating an agent"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    config: Optional[AgentConfigFull] = None


class AgentResponse(BaseModel):
    """Response schema for a single agent"""
    id: str = Field(..., description="Unique agent identifier")
    name: str = Field(..., description="Agent name")
    type: AgentType = Field(..., description="Agent type")
    type_category: AgentTypeCategory = Field(..., description="Type category")
    category: AgentCategory = Field(..., description="Business category")
    description: Optional[str] = Field(None, description="Agent description")
    config_version: str = Field(..., description="Configuration version")
    tools_enabled: List[str] = Field(default_factory=list, description="Enabled tool IDs")
    is_existing_agent: bool = Field(False, description="Whether this is a pre-built agent")
    has_ai_builder: bool = Field(False, description="Whether AI builder is available")
    app_id: Optional[str] = Field(None, description="Associated application ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "agent-123",
                "name": "Credit Memo Analyzer",
                "type": "Analysis",
                "type_category": "Industry",
                "category": "Banking",
                "description": "Analyzes credit memos for risk assessment",
                "config_version": "1.0.0",
                "tools_enabled": ["pdf-parser", "risk-calculator"],
                "is_existing_agent": True,
                "has_ai_builder": True,
                "app_id": "app-123",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-20T14:45:00Z"
            }
        }


class AgentListResponse(BaseModel):
    """Response schema for listing agents"""
    items: List[AgentResponse] = Field(..., description="List of agents")
    total: int = Field(..., description="Total count")
