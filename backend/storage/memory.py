"""
In-memory storage implementation
TODO: Replace with actual database integration
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import uuid4


class InMemoryStorage:
    """
    Simple in-memory storage for development.
    All data is lost on restart.
    """

    def __init__(self):
        self._apps: Dict[str, Dict[str, Any]] = {}
        self._agents: Dict[str, Dict[str, Any]] = {}
        self._orchestrations: Dict[str, Dict[str, Any]] = {}
        self._runs: Dict[str, Dict[str, Any]] = {}
        self._violations: Dict[str, Dict[str, Any]] = {}
        self._agent_library: Dict[str, Dict[str, Any]] = {}
        
        # Initialize with sample data
        self._seed_data()

    def _seed_data(self):
        """Seed initial development data"""
        # Sample apps
        sample_apps = [
            {
                "id": "app-1",
                "name": "Credit Memo Processor",
                "description": "AI-powered credit memo analysis and generation",
                "version": "1.2.0",
                "status": "Deployed",
                "agent_count": 4,
                "created_at": datetime(2024, 1, 15, 10, 30),
                "updated_at": datetime(2024, 1, 20, 14, 45),
                "created_by": "admin@example.com",
            },
            {
                "id": "app-2",
                "name": "Trade Reconciliation",
                "description": "Automated trade matching and reconciliation",
                "version": "2.0.0",
                "status": "Draft",
                "agent_count": 3,
                "created_at": datetime(2024, 1, 10, 9, 0),
                "updated_at": datetime(2024, 1, 18, 11, 30),
                "created_by": "admin@example.com",
            },
        ]
        for app in sample_apps:
            self._apps[app["id"]] = app

        # Sample agents in library
        library_agents = [
            {
                "id": "lib-agent-1",
                "name": "Enterprise RAG Agent",
                "type": "Extractor",
                "type_category": "Core Intelligence",
                "category": "Knowledge & RAG",
                "description": "Advanced retrieval-augmented generation for enterprise knowledge bases",
                "config_version": "2.0.0",
                "tools_enabled": ["vector-search", "document-loader", "embeddings"],
                "is_existing_agent": True,
                "has_ai_builder": True,
                "app_id": None,
                "created_at": datetime(2024, 1, 1),
                "updated_at": datetime(2024, 1, 15),
            },
            {
                "id": "lib-agent-2",
                "name": "Credit Memo Agent",
                "type": "Analysis",
                "type_category": "Industry",
                "category": "Banking",
                "description": "Automated credit memo generation and analysis for banking",
                "config_version": "3.0.0",
                "tools_enabled": ["credit-calculator", "risk-scorer", "compliance-checker"],
                "is_existing_agent": True,
                "has_ai_builder": True,
                "app_id": None,
                "created_at": datetime(2024, 1, 1),
                "updated_at": datetime(2024, 1, 20),
            },
            {
                "id": "lib-agent-3",
                "name": "Document Parser",
                "type": "Extractor",
                "type_category": "Function",
                "category": "Document Analysis",
                "description": "Universal document parsing and data extraction",
                "config_version": "2.5.0",
                "tools_enabled": ["pdf-parser", "ocr-engine", "table-extractor"],
                "is_existing_agent": True,
                "has_ai_builder": False,
                "app_id": None,
                "created_at": datetime(2024, 1, 1),
                "updated_at": datetime(2024, 1, 10),
            },
        ]
        for agent in library_agents:
            self._agent_library[agent["id"]] = agent

    # ==================== Apps ====================
    
    def create_app(self, data: Dict[str, Any]) -> Dict[str, Any]:
        app_id = f"app-{uuid4().hex[:8]}"
        now = datetime.utcnow()
        app = {
            "id": app_id,
            "name": data["name"],
            "description": data.get("description"),
            "version": "0.1.0",
            "status": "Draft",
            "agent_count": 0,
            "created_at": now,
            "updated_at": now,
            "created_by": data.get("created_by"),
        }
        self._apps[app_id] = app
        return app

    def get_app(self, app_id: str) -> Optional[Dict[str, Any]]:
        return self._apps.get(app_id)

    def list_apps(self) -> List[Dict[str, Any]]:
        return list(self._apps.values())

    def update_app(self, app_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if app_id not in self._apps:
            return None
        app = self._apps[app_id]
        for key, value in data.items():
            if value is not None:
                app[key] = value
        app["updated_at"] = datetime.utcnow()
        return app

    def delete_app(self, app_id: str) -> bool:
        if app_id in self._apps:
            del self._apps[app_id]
            return True
        return False

    # ==================== Agents ====================

    def create_agent(self, data: Dict[str, Any]) -> Dict[str, Any]:
        agent_id = f"agent-{uuid4().hex[:8]}"
        now = datetime.utcnow()
        agent = {
            "id": agent_id,
            "name": data["name"],
            "type": data["type"],
            "type_category": data["type_category"],
            "category": data["category"],
            "description": data.get("description"),
            "config_version": "0.1.0",
            "tools_enabled": data.get("tools_enabled", []),
            "is_existing_agent": data.get("is_existing_agent", False),
            "has_ai_builder": data.get("has_ai_builder", False),
            "app_id": data.get("app_id"),
            "config": data.get("config"),
            "created_at": now,
            "updated_at": now,
        }
        self._agents[agent_id] = agent
        
        # Update app agent count
        if agent["app_id"] and agent["app_id"] in self._apps:
            self._apps[agent["app_id"]]["agent_count"] += 1
        
        return agent

    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        return self._agents.get(agent_id)

    def list_agents(self, app_id: Optional[str] = None) -> List[Dict[str, Any]]:
        agents = list(self._agents.values())
        if app_id:
            agents = [a for a in agents if a.get("app_id") == app_id]
        return agents

    def update_agent(self, agent_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if agent_id not in self._agents:
            return None
        agent = self._agents[agent_id]
        for key, value in data.items():
            if value is not None:
                agent[key] = value
        agent["updated_at"] = datetime.utcnow()
        return agent

    def delete_agent(self, agent_id: str) -> bool:
        if agent_id in self._agents:
            agent = self._agents[agent_id]
            # Update app agent count
            if agent.get("app_id") and agent["app_id"] in self._apps:
                self._apps[agent["app_id"]]["agent_count"] -= 1
            del self._agents[agent_id]
            return True
        return False

    # ==================== Agent Library ====================

    def list_agent_library(self) -> List[Dict[str, Any]]:
        return list(self._agent_library.values())

    def get_library_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        return self._agent_library.get(agent_id)

    # ==================== Orchestration ====================

    def save_orchestration(self, app_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        self._orchestrations[app_id] = {
            "app_id": app_id,
            "nodes": data.get("nodes", []),
            "edges": data.get("edges", []),
            "entry_node": data.get("entry_node"),
            "metadata": data.get("metadata"),
            "updated_at": datetime.utcnow(),
        }
        return self._orchestrations[app_id]

    def get_orchestration(self, app_id: str) -> Optional[Dict[str, Any]]:
        return self._orchestrations.get(app_id)

    # ==================== Runs & Observability ====================

    def create_run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        run_id = f"run-{uuid4().hex[:8]}"
        run = {
            "id": run_id,
            **data,
            "started_at": datetime.utcnow(),
        }
        self._runs[run_id] = run
        return run

    def list_runs(self, app_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        runs = list(self._runs.values())
        if app_id:
            runs = [r for r in runs if r.get("app_id") == app_id]
        return sorted(runs, key=lambda x: x.get("started_at", datetime.min), reverse=True)[:limit]

    def create_violation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        violation_id = f"violation-{uuid4().hex[:8]}"
        violation = {
            "id": violation_id,
            **data,
            "timestamp": datetime.utcnow(),
        }
        self._violations[violation_id] = violation
        return violation

    def list_violations(self, limit: int = 100) -> List[Dict[str, Any]]:
        violations = list(self._violations.values())
        return sorted(violations, key=lambda x: x.get("timestamp", datetime.min), reverse=True)[:limit]
