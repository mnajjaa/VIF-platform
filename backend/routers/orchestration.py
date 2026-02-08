"""
Orchestration Router - Agent workflow orchestration management
"""

from typing import List
from fastapi import APIRouter, HTTPException

from schemas.orchestration import (
    OrchestrationConfig,
    OrchestrationValidationResult,
)
from storage import storage

router = APIRouter()


@router.get("/{app_id}", response_model=OrchestrationConfig)
async def get_orchestration(app_id: str):
    """
    Get the orchestration configuration for an application.
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    orchestration = storage.get_orchestration(app_id)
    if not orchestration:
        # Return empty orchestration
        return OrchestrationConfig(
            app_id=app_id,
            nodes=[],
            edges=[],
            entry_node=None,
        )
    
    return OrchestrationConfig(**orchestration)


@router.put("/{app_id}", response_model=OrchestrationConfig)
async def save_orchestration(app_id: str, config: OrchestrationConfig):
    """
    Save/update the orchestration configuration for an application.
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    orchestration = storage.save_orchestration(app_id, config.model_dump())
    return OrchestrationConfig(**orchestration)


@router.post("/{app_id}/validate", response_model=OrchestrationValidationResult)
async def validate_orchestration(app_id: str):
    """
    Validate the orchestration configuration.
    
    Checks for:
    - Circular dependencies
    - Unreachable nodes
    - Missing agent references
    - Entry point configuration
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    orchestration = storage.get_orchestration(app_id)
    if not orchestration:
        return OrchestrationValidationResult(
            valid=False,
            errors=["No orchestration configured"],
            warnings=[],
        )
    
    errors: List[str] = []
    warnings: List[str] = []
    
    nodes = orchestration.get("nodes", [])
    edges = orchestration.get("edges", [])
    entry_node = orchestration.get("entry_node")
    
    # Check for empty orchestration
    if not nodes:
        errors.append("Orchestration has no nodes")
    
    # Check entry node
    if not entry_node:
        warnings.append("No entry node specified")
    elif entry_node not in [n.get("id") for n in nodes]:
        errors.append(f"Entry node '{entry_node}' not found in nodes")
    
    # Check for orphan nodes (no incoming or outgoing edges)
    node_ids = {n.get("id") for n in nodes}
    sources = {e.get("source") for e in edges}
    targets = {e.get("target") for e in edges}
    
    for node_id in node_ids:
        if node_id not in sources and node_id not in targets and node_id != entry_node:
            warnings.append(f"Node '{node_id}' has no connections")
    
    # Check for invalid edge references
    for edge in edges:
        if edge.get("source") not in node_ids:
            errors.append(f"Edge source '{edge.get('source')}' not found in nodes")
        if edge.get("target") not in node_ids:
            errors.append(f"Edge target '{edge.get('target')}' not found in nodes")
    
    # Check for circular dependencies (simple cycle detection)
    # TODO: Implement proper topological sort for complex graphs
    visited = set()
    rec_stack = set()
    
    def has_cycle(node_id: str) -> bool:
        visited.add(node_id)
        rec_stack.add(node_id)
        
        for edge in edges:
            if edge.get("source") == node_id:
                neighbor = edge.get("target")
                if neighbor not in visited:
                    if has_cycle(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
        
        rec_stack.discard(node_id)
        return False
    
    for node in nodes:
        node_id = node.get("id")
        if node_id not in visited:
            if has_cycle(node_id):
                errors.append("Circular dependency detected in orchestration graph")
                break
    
    # Verify all agent nodes have valid agent IDs
    for node in nodes:
        if node.get("type") == "agent":
            agent_id = node.get("agent_id")
            if agent_id:
                agent = storage.get_agent(agent_id)
                if not agent:
                    errors.append(f"Agent '{agent_id}' referenced in node '{node.get('id')}' not found")
    
    return OrchestrationValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )


@router.post("/{app_id}/export-yaml")
async def export_orchestration_yaml(app_id: str):
    """
    Export orchestration configuration as YAML.
    
    Returns the orchestration in a format suitable for CI/CD pipelines.
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    orchestration = storage.get_orchestration(app_id)
    if not orchestration:
        raise HTTPException(status_code=404, detail=f"No orchestration configured for {app_id}")
    
    # Build YAML-friendly structure
    yaml_config = {
        "version": "1.0",
        "app": {
            "id": app_id,
            "name": app.get("name"),
        },
        "orchestration": {
            "entry_node": orchestration.get("entry_node"),
            "nodes": [
                {
                    "id": n.get("id"),
                    "type": n.get("type"),
                    "agent_id": n.get("agent_id"),
                }
                for n in orchestration.get("nodes", [])
            ],
            "edges": [
                {
                    "from": e.get("source"),
                    "to": e.get("target"),
                    "condition": e.get("condition"),
                }
                for e in orchestration.get("edges", [])
            ],
        },
    }
    
    return yaml_config
