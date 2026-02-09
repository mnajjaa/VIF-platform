"""
Agentic Hub Platform - FastAPI Backend
Main application entry point
"""

import json

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException

from routers import apps, agents, orchestration, observability
from errors import AppNotFoundError, AgentValidationError, OrchestrationError

# ==================== App Setup ====================

app = FastAPI(
    title="Agentic Hub API",
    description="Backend API for the Agentic Hub Platform - Enterprise AI Agent Management",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Response Wrapper Middleware ====================

@app.middleware("http")
async def wrap_responses(request: Request, call_next):
    response = await call_next(request)

    # Skip wrapping for docs/openapi
    if request.url.path in ("/docs", "/redoc", "/openapi.json"):
        return response

    # Only wrap JSON responses
    if response.media_type != "application/json":
        return response

    # Read original response body
    body = b""
    async for chunk in response.body_iterator:
        body += chunk

    # Parse JSON if possible
    data = None
    if body:
        try:
            data = json.loads(body.decode("utf-8"))
        except Exception:
            data = None

    success = 200 <= response.status_code < 400
    if success:
        wrapped = {
            "data": data,
            "error": None,
            "success": True,
        }
    else:
        error_message = "Request failed"
        if isinstance(data, dict):
            if "error" in data and isinstance(data.get("error"), str):
                error_message = data.get("error") or error_message
            elif "detail" in data and isinstance(data.get("detail"), str):
                error_message = data.get("detail") or error_message
        wrapped = {
            "data": None,
            "error": error_message,
            "success": False,
        }
        if isinstance(data, dict):
            if "code" in data:
                wrapped["code"] = data.get("code")
            if "details" in data:
                wrapped["details"] = data.get("details")

    headers = dict(response.headers)
    headers.pop("content-length", None)
    return JSONResponse(status_code=response.status_code, content=wrapped, headers=headers)


# ==================== Exception Handlers ====================

def _error_response(message: str, code: str, details: dict | None = None, status_code: int = 400):
    return JSONResponse(
        status_code=status_code,
        content={
            "error": message,
            "code": code,
            "details": details or {},
        },
    )


@app.exception_handler(AppNotFoundError)
async def handle_app_not_found(request: Request, exc: AppNotFoundError):
    return _error_response(exc.message, exc.code, exc.details, status_code=404)


@app.exception_handler(AgentValidationError)
async def handle_agent_validation(request: Request, exc: AgentValidationError):
    return _error_response(exc.message, exc.code, exc.details, status_code=422)


@app.exception_handler(OrchestrationError)
async def handle_orchestration_error(request: Request, exc: OrchestrationError):
    return _error_response(exc.message, exc.code, exc.details, status_code=400)


@app.exception_handler(HTTPException)
async def handle_http_exception(request: Request, exc: HTTPException):
    return _error_response(str(exc.detail), "HTTP_ERROR", status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def handle_request_validation(request: Request, exc: RequestValidationError):
    return _error_response("Validation error", "REQUEST_VALIDATION_ERROR", {"errors": exc.errors()}, status_code=422)


# ==================== Routers ====================

app.include_router(apps.router, prefix="/apps", tags=["Applications"])
app.include_router(agents.router, prefix="/agents", tags=["Agents"])
app.include_router(orchestration.router, prefix="/orchestration", tags=["Orchestration"])
app.include_router(observability.router, prefix="/observability", tags=["Observability"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "agentic-hub-api", "version": "0.1.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "components": {
            "api": "up",
            "storage": "in-memory",  # TODO: Replace with actual DB status
        },
    }
