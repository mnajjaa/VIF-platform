"""
Applications Router - CRUD operations for Intelligent Apps
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from pydantic import ValidationError as PydanticValidationError

from schemas.apps import AppCreate, AppUpdate, AppResponse, AppListResponse, AppStatus
from schemas.agents import AgentCreate, AgentResponse, AgentConfigFull
from storage import storage
from errors import AppNotFoundError, AgentValidationError, OrchestrationError

router = APIRouter()

_ALLOWED_STATUS_TRANSITIONS = {
    AppStatus.DRAFT.value: {AppStatus.DEPLOYED.value, AppStatus.ARCHIVED.value},
    AppStatus.DEPLOYED.value: {AppStatus.ARCHIVED.value},
    AppStatus.ARCHIVED.value: set(),
}


def _normalize_status(status):
    if isinstance(status, AppStatus):
        return status.value
    return status


def _validate_status_transition(current_status, new_status) -> None:
    current = _normalize_status(current_status)
    new = _normalize_status(new_status)
    if new == current:
        return
    allowed = _ALLOWED_STATUS_TRANSITIONS.get(current, set())
    if new not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition: {current} -> {new}",
        )


def _validate_agent_configs(app_id: str) -> None:
    errors = []
    agents = storage.list_agents(app_id=app_id)
    for agent in agents:
        agent_id = agent.get("id")
        config = agent.get("config")
        if not config:
            errors.append(f"Agent '{agent_id}' is missing config")
            continue
        try:
            AgentConfigFull(**config)
        except PydanticValidationError as exc:
            errors.append(f"Agent '{agent_id}' has invalid config: {exc.errors()}")
    if errors:
        raise AgentValidationError(
            "Agent config validation failed",
            details={"errors": errors},
        )


def _validate_orchestration(app_id: str) -> None:
    orchestration = storage.get_orchestration(app_id)
    if not orchestration:
        raise OrchestrationError(
            "Orchestration validation failed",
            details={"errors": ["No orchestration configured"], "warnings": []},
        )

    errors: List[str] = []
    warnings: List[str] = []

    nodes = orchestration.get("nodes", [])
    edges = orchestration.get("edges", [])
    entry_node = orchestration.get("entry_node")

    if not nodes:
        errors.append("Orchestration has no nodes")

    if not entry_node:
        warnings.append("No entry node specified")
    elif entry_node not in [n.get("id") for n in nodes]:
        errors.append(f"Entry node '{entry_node}' not found in nodes")

    node_ids = {n.get("id") for n in nodes}
    sources = {e.get("source") for e in edges}
    targets = {e.get("target") for e in edges}

    for node_id in node_ids:
        if node_id not in sources and node_id not in targets and node_id != entry_node:
            warnings.append(f"Node '{node_id}' has no connections")

    for edge in edges:
        if edge.get("source") not in node_ids:
            errors.append(f"Edge source '{edge.get('source')}' not found in nodes")
        if edge.get("target") not in node_ids:
            errors.append(f"Edge target '{edge.get('target')}' not found in nodes")

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

    for node in nodes:
        if node.get("type") == "agent":
            agent_id = node.get("agent_id")
            if agent_id:
                agent = storage.get_agent(agent_id)
                if not agent:
                    errors.append(f"Agent '{agent_id}' referenced in node '{node.get('id')}' not found")

    if errors:
        raise OrchestrationError(
            "Orchestration validation failed",
            details={"errors": errors, "warnings": warnings},
        )


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
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max items to return"),
    status: Optional[str] = Query(None, description="Filter by status"),
    sort: str = Query("created_at", description="Sort field"),
    order: str = Query("desc", description="Sort order (asc|desc)"),
):
    """
    List all Intelligent Applications with pagination.
    """
    apps = storage.list_apps()
    
    # Filter by status if provided
    if status:
        apps = [a for a in apps if a.get("status") == status]

    sort_key = sort.strip().lower() if sort else "created_at"
    order_value = order.strip().lower() if order else "desc"
    allowed_sorts = {"created_at"}
    if sort_key not in allowed_sorts:
        raise HTTPException(status_code=400, detail=f"Invalid sort field '{sort}'")
    if order_value not in {"asc", "desc"}:
        raise HTTPException(status_code=400, detail="Invalid sort order. Use 'asc' or 'desc'")

    reverse = order_value == "desc"
    def sort_value(app):
        value = app.get(sort_key)
        return value if value is not None else ""

    apps = sorted(apps, key=sort_value, reverse=reverse)

    total = len(apps)
    start = skip
    end = skip + limit
    paginated_apps = apps[start:end]
    page = (skip // limit) + 1

    return AppListResponse(
        items=[AppResponse(**a) for a in paginated_apps],
        total=total,
        page=page,
        page_size=limit,
    )


@router.get("/{app_id}", response_model=AppResponse)
async def get_app(app_id: str):
    """
    Get a single Intelligent Application by ID.
    """
    app = storage.get_app(app_id)
    if not app:
            raise AppNotFoundError(f"App {app_id} not found")
    return AppResponse(**app)


@router.patch("/{app_id}", response_model=AppResponse)
async def update_app(app_id: str, app_data: AppUpdate):
    """
    Update an existing Intelligent Application.
    """
    app = storage.get_app(app_id)
    if not app:
        raise AppNotFoundError(f"App {app_id} not found")

    update_data = app_data.model_dump(exclude_unset=True)
    if "status" in update_data:
        _validate_status_transition(app.get("status"), update_data.get("status"))

    app = storage.update_app(app_id, update_data)
    if not app:
        raise AppNotFoundError(f"App {app_id} not found")
    return AppResponse(**app)


@router.delete("/{app_id}", status_code=204)
async def delete_app(app_id: str):
    """
    Delete an Intelligent Application.
    """
    if not storage.delete_app(app_id):
        raise AppNotFoundError(f"App {app_id} not found")
    return None


@router.post("/{app_id}/deploy", response_model=AppResponse)
async def deploy_app(app_id: str):
    """
    Deploy an application (change status to Deployed).
    
    TODO: Add actual deployment logic (validation, CI/CD trigger, etc.)
    """
    app = storage.get_app(app_id)
    if not app:
        raise AppNotFoundError(f"App {app_id} not found")
    
    current_status = app.get("status")
    if current_status != AppStatus.DRAFT.value:
        raise HTTPException(status_code=400, detail="Only Draft applications can be deployed")

    _validate_agent_configs(app_id)
    _validate_orchestration(app_id)
    
    updated = storage.update_app(app_id, {"status": "Deployed"})
    return AppResponse(**updated)


@router.post("/{app_id}/archive", response_model=AppResponse)
async def archive_app(app_id: str):
    """
    Archive an application (change status to Archived).
    """
    app = storage.get_app(app_id)
    if not app:
        raise AppNotFoundError(f"App {app_id} not found")

    _validate_status_transition(app.get("status"), AppStatus.ARCHIVED.value)
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
        raise AppNotFoundError(f"App {app_id} not found")
    
    agents = storage.list_agents(app_id=app_id)
    return [AgentResponse(**a) for a in agents]


@router.post("/{app_id}/agents", response_model=AgentResponse, status_code=201)
async def add_agent_to_app(app_id: str, agent_data: AgentCreate):
    """
    Create a new agent and add it to an application.
    """
    app = storage.get_app(app_id)
    if not app:
        raise AppNotFoundError(f"Application {app_id} not found")
    
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
        raise AppNotFoundError(f"Application {app_id} not found")
    
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
