"""
Applications Router - CRUD operations for Intelligent Apps
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from schemas.apps import AppCreate, AppUpdate, AppResponse, AppListResponse
from schemas.agents import AgentCreate, AgentResponse
from storage import storage

router = APIRouter()


@router.post("/", response_model=AppResponse, status_code=201)
async def create_app(app_data: AppCreate):
    """
    Create a new Intelligent Application.
    
    After creation, navigate to onboarding to add agents.
    """
    app = storage.create_app(app_data.model_dump())
    return AppResponse(**app)


@router.get("/", response_model=AppListResponse)
async def list_apps(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """
    List all Intelligent Applications with pagination.
    """
    apps = storage.list_apps()
    
    # Filter by status if provided
    if status:
        apps = [a for a in apps if a.get("status") == status]
    
    total = len(apps)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_apps = apps[start:end]
    
    return AppListResponse(
        items=[AppResponse(**a) for a in paginated_apps],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{app_id}", response_model=AppResponse)
async def get_app(app_id: str):
    """
    Get a single Intelligent Application by ID.
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    return AppResponse(**app)


@router.patch("/{app_id}", response_model=AppResponse)
async def update_app(app_id: str, app_data: AppUpdate):
    """
    Update an existing Intelligent Application.
    """
    app = storage.update_app(app_id, app_data.model_dump(exclude_unset=True))
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    return AppResponse(**app)


@router.delete("/{app_id}", status_code=204)
async def delete_app(app_id: str):
    """
    Delete an Intelligent Application.
    """
    if not storage.delete_app(app_id):
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    return None


@router.post("/{app_id}/deploy", response_model=AppResponse)
async def deploy_app(app_id: str):
    """
    Deploy an application (change status to Deployed).
    
    TODO: Add actual deployment logic (validation, CI/CD trigger, etc.)
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    if app.get("status") == "Archived":
        raise HTTPException(status_code=400, detail="Cannot deploy an archived application")
    
    updated = storage.update_app(app_id, {"status": "Deployed"})
    return AppResponse(**updated)


@router.post("/{app_id}/archive", response_model=AppResponse)
async def archive_app(app_id: str):
    """
    Archive an application (change status to Archived).
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    updated = storage.update_app(app_id, {"status": "Archived"})
    return AppResponse(**updated)


# ==================== App Agents ====================

@router.get("/{app_id}/agents", response_model=List[AgentResponse])
async def list_app_agents(app_id: str):
    """
    List all agents belonging to an application.
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    agents = storage.list_agents(app_id=app_id)
    return [AgentResponse(**a) for a in agents]


@router.post("/{app_id}/agents", response_model=AgentResponse, status_code=201)
async def add_agent_to_app(app_id: str, agent_data: AgentCreate):
    """
    Create a new agent and add it to an application.
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    agent_dict = agent_data.model_dump()
    agent_dict["app_id"] = app_id
    agent = storage.create_agent(agent_dict)
    return AgentResponse(**agent)


@router.post("/{app_id}/agents/from-library/{library_agent_id}", response_model=AgentResponse, status_code=201)
async def add_library_agent_to_app(app_id: str, library_agent_id: str):
    """
    Add an agent from the library to an application.
    Creates a copy of the library agent linked to this app.
    """
    app = storage.get_app(app_id)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    
    library_agent = storage.get_library_agent(library_agent_id)
    if not library_agent:
        raise HTTPException(status_code=404, detail=f"Library agent {library_agent_id} not found")
    
    # Create a copy of the library agent for this app
    agent_data = {
        "name": library_agent["name"],
        "type": library_agent["type"],
        "type_category": library_agent["type_category"],
        "category": library_agent["category"],
        "description": library_agent["description"],
        "tools_enabled": library_agent.get("tools_enabled", []),
        "is_existing_agent": library_agent.get("is_existing_agent", True),
        "has_ai_builder": library_agent.get("has_ai_builder", False),
        "app_id": app_id,
    }
    agent = storage.create_agent(agent_data)
    return AgentResponse(**agent)
