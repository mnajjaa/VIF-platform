"""
Pydantic schemas for Orchestration
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class OrchestrationNode(BaseModel):
    """A node in the orchestration graph"""
    id: str = Field(..., description="Node identifier (usually agent ID)")
    type: str = Field("agent", description="Node type (agent, conditional, parallel)")
    agent_id: Optional[str] = Field(None, description="Associated agent ID")
    position: Dict[str, float] = Field(
        default_factory=lambda: {"x": 0, "y": 0},
        description="Visual position in graph"
    )
    config: Optional[Dict[str, Any]] = Field(None, description="Node-specific configuration")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "node-1",
                "type": "agent",
                "agent_id": "agent-123",
                "position": {"x": 100, "y": 200},
                "config": {}
            }
        }


class OrchestrationEdge(BaseModel):
    """An edge connecting nodes in the orchestration graph"""
    id: str = Field(..., description="Edge identifier")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    condition: Optional[str] = Field(None, description="Conditional expression")
    label: Optional[str] = Field(None, description="Edge label")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "edge-1",
                "source": "node-1",
                "target": "node-2",
                "condition": None,
                "label": "success"
            }
        }


class OrchestrationConfig(BaseModel):
    """Complete orchestration configuration for an app"""
    app_id: str = Field(..., description="Application ID")
    nodes: List[OrchestrationNode] = Field(default_factory=list, description="Graph nodes")
    edges: List[OrchestrationEdge] = Field(default_factory=list, description="Graph edges")
    entry_node: Optional[str] = Field(None, description="Entry point node ID")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "app_id": "app-123",
                "nodes": [
                    {"id": "node-1", "type": "agent", "agent_id": "agent-1", "position": {"x": 0, "y": 0}},
                    {"id": "node-2", "type": "agent", "agent_id": "agent-2", "position": {"x": 200, "y": 0}}
                ],
                "edges": [
                    {"id": "edge-1", "source": "node-1", "target": "node-2"}
                ],
                "entry_node": "node-1"
            }
        }


class OrchestrationValidationResult(BaseModel):
    """Result of orchestration validation"""
    valid: bool = Field(..., description="Whether the orchestration is valid")
    errors: List[str] = Field(default_factory=list, description="Validation errors")
    warnings: List[str] = Field(default_factory=list, description="Validation warnings")

    class Config:
        json_schema_extra = {
            "example": {
                "valid": False,
                "errors": ["Circular dependency detected between node-1 and node-3"],
                "warnings": ["Node node-2 has no outgoing edges"]
            }
        }
