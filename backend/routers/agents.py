"""
Agents Router - CRUD operations for AI Agents and Agent Library
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from schemas.agents import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentListResponse,
    AgentConfigFull,
)
from storage import storage

router = APIRouter()


# ==================== Agent Library ====================

@router.get("/library", response_model=List[AgentResponse])
async def list_agent_library(
    type_category: Optional[str] = Query(None, description="Filter by type category"),
    category: Optional[str] = Query(None, description="Filter by business category"),
    is_existing_agent: Optional[bool] = Query(None, description="Filter by existing agent flag"),
):
    """
    List all agents in the agent library.
    
    These are pre-built agents that can be added to applications.
    """
    agents = storage.list_agent_library()
    
    # Apply filters
    if type_category:
        agents = [a for a in agents if a.get("type_category") == type_category]
    if category:
        agents = [a for a in agents if a.get("category") == category]
    if is_existing_agent is not None:
        agents = [a for a in agents if a.get("is_existing_agent") == is_existing_agent]
    
    return [AgentResponse(**a) for a in agents]


@router.get("/library/{agent_id}", response_model=AgentResponse)
async def get_library_agent(agent_id: str):
    """
    Get a single agent from the library.
    """
    agent = storage.get_library_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Library agent {agent_id} not found")
    return AgentResponse(**agent)


# ==================== Agent CRUD ====================

@router.post("/", response_model=AgentResponse, status_code=201)
async def create_agent(agent_data: AgentCreate):
    """
    Create a new agent (not associated with any app initially).
    """
    agent = storage.create_agent(agent_data.model_dump())
    return AgentResponse(**agent)


@router.get("/", response_model=AgentListResponse)
async def list_agents(
    app_id: Optional[str] = Query(None, description="Filter by application ID"),
):
    """
    List all agents, optionally filtered by application.
    """
    agents = storage.list_agents(app_id=app_id)
    return AgentListResponse(
        items=[AgentResponse(**a) for a in agents],
        total=len(agents),
    )


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """
    Get a single agent by ID.
    """
    agent = storage.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    return AgentResponse(**agent)


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(agent_id: str, agent_data: AgentUpdate):
    """
    Update an existing agent.
    """
    agent = storage.update_agent(agent_id, agent_data.model_dump(exclude_unset=True))
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    return AgentResponse(**agent)


@router.delete("/{agent_id}", status_code=204)
async def delete_agent(agent_id: str):
    """
    Delete an agent.
    """
    if not storage.delete_agent(agent_id):
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    return None


# ==================== Agent Configuration ====================

@router.get("/{agent_id}/config", response_model=AgentConfigFull)
async def get_agent_config(agent_id: str):
    """
    Get the full configuration for an agent.
    
    TODO: Integrate with MLflow for prompt/schema resolution
    """
    agent = storage.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    # Return config if exists, otherwise return default
    config = agent.get("config")
    if config:
        return AgentConfigFull(**config)
    
    # Return default config
    return AgentConfigFull(
        model={
            "provider": "azure-openai",
            "model_id": "gpt-4o",
            "temperature": 0.7,
            "max_tokens": 4096,
        },
        prompts={
            "system_prompt_uri": None,
            "task_prompt_uri": None,
        },
        schemas={
            "input_schema_uri": None,
            "output_schema_uri": None,
        },
        tools=[],
        memory={
            "enabled": False,
            "type": "conversation",
            "max_tokens": 2000,
        },
    )


@router.put("/{agent_id}/config", response_model=AgentConfigFull)
async def update_agent_config(agent_id: str, config: AgentConfigFull):
    """
    Update the full configuration for an agent.
    
    TODO: Validate prompts/schemas exist in MLflow
    """
    agent = storage.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    # Update agent with new config
    storage.update_agent(agent_id, {"config": config.model_dump()})
    return config


@router.post("/{agent_id}/config/validate")
async def validate_agent_config(agent_id: str):
    """
    Validate an agent's configuration.
    
    TODO: Implement actual validation logic
    - Check model availability
    - Verify MLflow prompt URIs
    - Validate JSONSchema URIs
    """
    agent = storage.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    # TODO: Implement validation
    return {
        "valid": True,
        "errors": [],
        "warnings": [],
    }
