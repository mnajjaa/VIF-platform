"""
Agentic Hub Platform - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import apps, agents, orchestration, observability

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

# Include routers
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
