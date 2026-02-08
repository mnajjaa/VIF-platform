"""
Pydantic schemas for Observability
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RunStatus(str, Enum):
    SUCCESS = "Success"
    FAILED = "Failed"
    RUNNING = "Running"
    PENDING = "Pending"


class RunRecord(BaseModel):
    """A single run/execution record"""
    id: str = Field(..., description="Run identifier")
    app_id: str = Field(..., description="Application ID")
    agent_id: Optional[str] = Field(None, description="Agent ID if single-agent run")
    status: RunStatus = Field(..., description="Run status")
    started_at: datetime = Field(..., description="Start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    latency_ms: Optional[int] = Field(None, description="Latency in milliseconds")
    tokens_used: Optional[int] = Field(None, description="Total tokens consumed")
    cost_usd: Optional[float] = Field(None, description="Estimated cost in USD")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "run-123",
                "app_id": "app-123",
                "agent_id": "agent-456",
                "status": "Success",
                "started_at": "2024-01-20T14:30:00Z",
                "completed_at": "2024-01-20T14:30:02Z",
                "latency_ms": 2100,
                "tokens_used": 1500,
                "cost_usd": 0.045,
                "error_message": None,
                "metadata": {"input_type": "pdf", "pages": 5}
            }
        }


class SchemaViolation(BaseModel):
    """A schema validation violation"""
    id: str = Field(..., description="Violation identifier")
    run_id: str = Field(..., description="Associated run ID")
    agent_id: str = Field(..., description="Agent that produced the violation")
    violation_type: str = Field(..., description="Type of violation")
    field: str = Field(..., description="Field that violated schema")
    expected: str = Field(..., description="Expected value/type")
    actual: str = Field(..., description="Actual value/type")
    severity: str = Field("error", description="Severity level")
    timestamp: datetime = Field(..., description="When violation occurred")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "violation-123",
                "run_id": "run-456",
                "agent_id": "agent-789",
                "violation_type": "type_mismatch",
                "field": "credit_score",
                "expected": "integer",
                "actual": "string",
                "severity": "error",
                "timestamp": "2024-01-20T14:30:02Z"
            }
        }


class MetricsSummary(BaseModel):
    """Summary metrics for observability dashboard"""
    total_runs: int = Field(..., description="Total number of runs")
    successful_runs: int = Field(..., description="Number of successful runs")
    failed_runs: int = Field(..., description="Number of failed runs")
    avg_latency_ms: float = Field(..., description="Average latency in milliseconds")
    error_rate: float = Field(..., description="Error rate as percentage")
    total_tokens: int = Field(..., description="Total tokens used")
    total_cost_usd: float = Field(..., description="Total estimated cost")
    schema_violations: int = Field(..., description="Total schema violations")
    period_start: datetime = Field(..., description="Metrics period start")
    period_end: datetime = Field(..., description="Metrics period end")

    class Config:
        json_schema_extra = {
            "example": {
                "total_runs": 12847,
                "successful_runs": 12615,
                "failed_runs": 232,
                "avg_latency_ms": 1200,
                "error_rate": 1.8,
                "total_tokens": 2400000,
                "total_cost_usd": 487.50,
                "schema_violations": 47,
                "period_start": "2024-01-01T00:00:00Z",
                "period_end": "2024-01-31T23:59:59Z"
            }
        }
