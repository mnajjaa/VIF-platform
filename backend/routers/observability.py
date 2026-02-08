"""
Observability Router - Monitoring, metrics, and compliance
"""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from schemas.observability import RunRecord, SchemaViolation, MetricsSummary
from storage import storage

router = APIRouter()


@router.get("/runs", response_model=List[RunRecord])
async def list_runs(
    app_id: Optional[str] = Query(None, description="Filter by application ID"),
    agent_id: Optional[str] = Query(None, description="Filter by agent ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum results"),
):
    """
    List execution runs with optional filters.
    """
    runs = storage.list_runs(app_id=app_id, limit=limit)
    
    # Apply additional filters
    if agent_id:
        runs = [r for r in runs if r.get("agent_id") == agent_id]
    if status:
        runs = [r for r in runs if r.get("status") == status]
    
    return [RunRecord(**r) for r in runs]


@router.get("/runs/{run_id}", response_model=RunRecord)
async def get_run(run_id: str):
    """
    Get details of a specific run.
    """
    runs = storage.list_runs()
    run = next((r for r in runs if r.get("id") == run_id), None)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    return RunRecord(**run)


@router.get("/violations", response_model=List[SchemaViolation])
async def list_violations(
    agent_id: Optional[str] = Query(None, description="Filter by agent ID"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum results"),
):
    """
    List schema violations.
    """
    violations = storage.list_violations(limit=limit)
    
    # Apply filters
    if agent_id:
        violations = [v for v in violations if v.get("agent_id") == agent_id]
    if severity:
        violations = [v for v in violations if v.get("severity") == severity]
    
    return [SchemaViolation(**v) for v in violations]


@router.get("/metrics", response_model=MetricsSummary)
async def get_metrics(
    app_id: Optional[str] = Query(None, description="Filter by application ID"),
    period_days: int = Query(30, ge=1, le=365, description="Metrics period in days"),
):
    """
    Get aggregated metrics summary.
    
    TODO: Implement actual metrics aggregation from time-series data
    """
    # For now, return mock metrics
    # In production, this would query a time-series database
    
    period_end = datetime.utcnow()
    period_start = period_end - timedelta(days=period_days)
    
    # Mock metrics (replace with actual aggregation)
    return MetricsSummary(
        total_runs=12847,
        successful_runs=12615,
        failed_runs=232,
        avg_latency_ms=1200.0,
        error_rate=1.8,
        total_tokens=2400000,
        total_cost_usd=487.50,
        schema_violations=47,
        period_start=period_start,
        period_end=period_end,
    )


@router.get("/metrics/by-agent")
async def get_metrics_by_agent(
    app_id: Optional[str] = Query(None, description="Filter by application ID"),
):
    """
    Get metrics breakdown by agent.
    
    TODO: Implement actual per-agent metrics
    """
    # Mock per-agent metrics
    return {
        "agents": [
            {
                "agent_id": "agent-1",
                "agent_name": "Data Extractor",
                "total_runs": 4500,
                "success_rate": 98.5,
                "avg_latency_ms": 850,
                "total_tokens": 800000,
            },
            {
                "agent_id": "agent-2",
                "agent_name": "Risk Analyzer",
                "total_runs": 3200,
                "success_rate": 97.2,
                "avg_latency_ms": 1500,
                "total_tokens": 950000,
            },
        ]
    }


@router.get("/traces/{run_id}")
async def get_run_traces(run_id: str):
    """
    Get detailed traces for a specific run.
    
    TODO: Integrate with tracing backend (Jaeger, Zipkin, etc.)
    """
    # Mock trace data
    return {
        "run_id": run_id,
        "spans": [
            {
                "id": "span-1",
                "name": "agent.process",
                "start_time": datetime.utcnow().isoformat(),
                "duration_ms": 1200,
                "status": "ok",
                "attributes": {
                    "agent_id": "agent-1",
                    "tokens_in": 500,
                    "tokens_out": 750,
                },
            },
            {
                "id": "span-2",
                "name": "tool.pdf_parser",
                "parent_id": "span-1",
                "start_time": datetime.utcnow().isoformat(),
                "duration_ms": 300,
                "status": "ok",
                "attributes": {
                    "pages_processed": 5,
                },
            },
        ],
    }


@router.get("/health")
async def observability_health():
    """
    Health check for observability subsystem.
    """
    return {
        "status": "healthy",
        "components": {
            "metrics_store": "ok",
            "trace_collector": "ok",
            "log_aggregator": "ok",
        },
    }
