"""
Shared API exception types.
"""

from typing import Optional, Dict, Any


class AppNotFoundError(Exception):
    def __init__(
        self,
        message: str = "App not found",
        code: str = "APP_NOT_FOUND",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.details = details or {}


class AgentValidationError(Exception):
    def __init__(
        self,
        message: str = "Agent validation failed",
        code: str = "AGENT_VALIDATION_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.details = details or {}


class OrchestrationError(Exception):
    def __init__(
        self,
        message: str = "Orchestration error",
        code: str = "ORCHESTRATION_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.details = details or {}
