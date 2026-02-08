# Agentic Hub Platform - Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Frontend (Next.js)](#frontend-nextjs)
4. [Backend (FastAPI)](#backend-fastapi)
5. [API Contracts](#api-contracts)
6. [Docker Deployment Strategy](#docker-deployment-strategy)
7. [Development Setup](#development-setup)

---

## Overview

The **Agentic Hub Platform** is an enterprise-grade AI orchestration platform designed for financial services. It provides a unified interface for managing intelligent applications, AI agents, orchestration workflows, prompts/artifacts, and observability.

### Key Features

- **Intelligent Apps Management**: Create, configure, deploy, and archive AI-powered applications
- **Agents Library**: Browse, select, and configure AI agents from a curated library
- **Orchestration Builder**: Visual node-based workflow designer with YAML export
- **Prompts & Artifacts**: Version-controlled prompt management via MLflow integration
- **Observability**: Real-time monitoring, traces, metrics, and schema violation tracking

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| Agent Runtime | Docker (Alpine/Slim), Python |
| Infrastructure | Kubernetes (optional), Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Next.js Frontend (Port 3000)                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │Dashboard │ │  Apps    │ │  Agents  │ │Orchestr. │ │Observab. │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ REST API (JSON)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                API LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    FastAPI Backend (Port 8000)                       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │    │
│  │  │  /apps   │ │ /agents  │ │/orchestr.│ │/observab.│               │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────────────┐
│    STORAGE LAYER      │ │   AGENT RUNTIME   │ │    EXTERNAL SERVICES      │
│  ┌─────────────────┐  │ │  ┌─────────────┐  │ │  ┌───────────────────┐    │
│  │  PostgreSQL     │  │ │  │Agent Pod 1  │  │ │  │  MLflow Registry  │    │
│  │  (Apps, Agents) │  │ │  │(Extractor)  │  │ │  │  (Prompts)        │    │
│  └─────────────────┘  │ │  └─────────────┘  │ │  └───────────────────┘    │
│  ┌─────────────────┐  │ │  ┌─────────────┐  │ │  ┌───────────────────┐    │
│  │  Redis          │  │ │  │Agent Pod 2  │  │ │  │  Azure OpenAI     │    │
│  │  (Cache/Queue)  │  │ │  │(Analyzer)   │  │ │  │  (LLM Provider)   │    │
│  └─────────────────┘  │ │  └─────────────┘  │ │  └───────────────────┘    │
│  ┌─────────────────┐  │ │  ┌─────────────┐  │ │  ┌───────────────────┐    │
│  │  S3/Blob        │  │ │  │Agent Pod N  │  │ │  │  Vector DB        │    │
│  │  (Artifacts)    │  │ │  │(Custom)     │  │ │  │  (Embeddings)     │    │
│  └─────────────────┘  │ │  └─────────────┘  │ │  └───────────────────┘    │
└───────────────────────┘ └───────────────────┘ └───────────────────────────┘
```

### Data Flow

1. User interacts with Next.js frontend
2. Frontend calls FastAPI backend via REST API
3. Backend validates requests using Pydantic schemas
4. Backend orchestrates agent execution via containerized agents
5. Agents call external LLM providers and return results
6. Results flow back through the stack to the UI

---

## Frontend (Next.js)

### Directory Structure

```
/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Dashboard (home)
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Tailwind CSS v4 theme
│   ├── apps/
│   │   ├── page.tsx              # Intelligent Apps list
│   │   └── [appId]/
│   │       ├── page.tsx          # App detail (tabbed view)
│   │       ├── onboarding/       # App creation wizard
│   │       ├── agent-library/    # Browse & add agents
│   │       └── agents/
│   │           ├── [agentId]/    # Agent configuration
│   │           └── new/          # Create new agent wizard
│   ├── agents/                   # Global agents library
│   ├── orchestration/            # Orchestration builder
│   ├── prompts/                  # Prompts & artifacts
│   ├── observability/            # Monitoring dashboard
│   └── settings/                 # Platform settings
│
├── components/
│   ├── layout/                   # Sidebar, MainLayout
│   ├── intelligent-apps/         # App-related components
│   ├── agents/                   # Agent-related components
│   ├── agent-config/             # Agent configuration form
│   ├── prompts/                  # Prompts table
│   ├── observability/            # Observability dashboard
│   ├── dashboard/                # Dashboard overview
│   ├── settings/                 # Settings page
│   ├── shared/                   # Reusable components
│   │   ├── status-badge.tsx
│   │   ├── agent-card.tsx
│   │   ├── app-card.tsx
│   │   ├── yaml-config-editor.tsx
│   │   ├── empty-state.tsx
│   │   └── loading-state.tsx
│   └── ui/                       # shadcn/ui components
│
├── lib/
│   ├── api.ts                    # API client layer
│   ├── types.ts                  # TypeScript interfaces
│   ├── placeholder-data.ts       # Mock data (dev only)
│   └── utils.ts                  # Utility functions
│
└── hooks/
    ├── use-toast.ts              # Toast notifications
    └── use-mobile.ts             # Mobile detection
```

### Key Components

#### AppsTable
Displays list of intelligent applications with status, version, agent count.
- Features: Sorting, filtering, CRUD actions via dropdown menu
- API: `GET /apps`, `POST /apps`, `PATCH /apps/{id}`, `DELETE /apps/{id}`

#### AppDetailTabs
Tabbed interface for app management:
- **Overview**: Summary metrics and quick actions
- **Agents**: List and configure agents within the app
- **Orchestration**: Visual workflow builder
- **Observability**: App-specific metrics and traces
- **Settings**: App configuration

#### AgentConfigForm
Multi-section form for agent configuration:
- Model settings (provider, model, temperature, max tokens)
- Prompts (system/task prompt URIs)
- Schemas (input/output JSONSchema URIs)
- Tools (toggle list with badges)
- Memory settings

#### OrchestrationGraph
Visual node-based workflow designer:
- Drag-and-drop agent nodes
- Connection lines with execution order
- YAML spec export
- Validation with error highlighting

### State Management

- **Server State**: SWR for data fetching and caching
- **Client State**: React useState/useReducer for UI state
- **URL State**: Next.js router for navigation state

### API Client Pattern

```typescript
// lib/api.ts
export const appsApi = {
  list: () => fetchApi<App[]>('/apps'),
  get: (id: string) => fetchApi<App>(`/apps/${id}`),
  create: (data: CreateAppInput) => fetchApi<App>('/apps', { method: 'POST', body: data }),
  update: (id: string, data: UpdateAppInput) => fetchApi<App>(`/apps/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => fetchApi<void>(`/apps/${id}`, { method: 'DELETE' }),
  deploy: (id: string) => fetchApi<App>(`/apps/${id}/deploy`, { method: 'POST' }),
  archive: (id: string) => fetchApi<App>(`/apps/${id}/archive`, { method: 'POST' }),
}
```

---

## Backend (FastAPI)

### Directory Structure

```
/backend
├── main.py                       # FastAPI app entry point
├── requirements.txt              # Python dependencies
│
├── routers/
│   ├── __init__.py
│   ├── apps.py                   # /apps endpoints
│   ├── agents.py                 # /agents endpoints
│   ├── orchestration.py          # /orchestration endpoints
│   └── observability.py          # /observability endpoints
│
├── schemas/
│   ├── __init__.py               # Schema exports
│   ├── apps.py                   # App Pydantic models
│   ├── agents.py                 # Agent Pydantic models
│   ├── orchestration.py          # Orchestration models
│   └── observability.py          # Observability models
│
├── storage/
│   ├── __init__.py
│   └── memory.py                 # In-memory storage (dev)
│
├── services/                     # Business logic (future)
│   ├── app_service.py
│   ├── agent_service.py
│   └── orchestration_service.py
│
└── agents/                       # Agent implementations
    ├── base.py                   # Base agent class
    ├── extractor.py
    ├── mapper.py
    ├── analyzer.py
    └── summarizer.py
```

### Pydantic Schemas

```python
# schemas/agents.py
class AgentConfig(BaseModel):
    model: ModelConfig
    prompts: PromptConfig
    schemas: SchemaConfig
    tools: list[ToolConfig]
    memory: MemoryConfig

class ModelConfig(BaseModel):
    provider: Literal["azure_openai", "openai", "anthropic", "aws_bedrock", "google_vertex"]
    model_name: str
    temperature: float = Field(ge=0.0, le=2.0, default=0.7)
    max_tokens: int = Field(ge=1, le=128000, default=4096)

class PromptConfig(BaseModel):
    system_prompt_uri: str  # MLflow URI: mlflow:/prompts/system-v1
    task_prompt_uri: str    # MLflow URI: mlflow:/prompts/task-v1
```

### API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/apps` | List all apps |
| POST | `/apps` | Create new app |
| GET | `/apps/{id}` | Get app details |
| PATCH | `/apps/{id}` | Update app |
| DELETE | `/apps/{id}` | Delete app |
| POST | `/apps/{id}/deploy` | Deploy app |
| POST | `/apps/{id}/archive` | Archive app |
| GET | `/apps/{id}/agents` | List app agents |
| POST | `/apps/{id}/agents` | Add agent to app |
| GET | `/agents/library` | List agent library |
| GET | `/agents/{id}` | Get agent details |
| GET | `/agents/{id}/config` | Get agent config |
| PUT | `/agents/{id}/config` | Update agent config |
| POST | `/agents/{id}/validate` | Validate agent config |
| GET | `/orchestration/{app_id}` | Get orchestration |
| PUT | `/orchestration/{app_id}` | Update orchestration |
| POST | `/orchestration/{app_id}/validate` | Validate workflow |
| GET | `/orchestration/{app_id}/export-yaml` | Export YAML spec |
| GET | `/observability/runs` | List execution runs |
| GET | `/observability/metrics` | Get platform metrics |
| GET | `/observability/violations` | List schema violations |
| GET | `/observability/traces/{run_id}` | Get run traces |

---

## API Contracts

### Create App

**Request:**
```http
POST /apps
Content-Type: application/json

{
  "name": "Credit Memo Processor",
  "description": "Automated credit memo analysis pipeline"
}
```

**Response:**
```json
{
  "id": "app-123",
  "name": "Credit Memo Processor",
  "description": "Automated credit memo analysis pipeline",
  "version": "1.0.0",
  "status": "draft",
  "agent_count": 0,
  "created_at": "2026-01-22T10:00:00Z",
  "updated_at": "2026-01-22T10:00:00Z"
}
```

### Create Agent

**Request:**
```http
POST /apps/{app_id}/agents
Content-Type: application/json

{
  "name": "Document Extractor",
  "type": "extractor",
  "type_category": "function",
  "category": "document_analysis",
  "description": "Extracts structured data from PDF documents",
  "config": {
    "model": {
      "provider": "azure_openai",
      "model_name": "gpt-4o",
      "temperature": 0.3,
      "max_tokens": 4096
    },
    "prompts": {
      "system_prompt_uri": "mlflow:/prompts/extractor-system-v1",
      "task_prompt_uri": "mlflow:/prompts/extractor-task-v1"
    },
    "schemas": {
      "input_schema_uri": "s3://schemas/extractor-input.json",
      "output_schema_uri": "s3://schemas/extractor-output.json"
    },
    "tools": [
      {"id": "pdf-parser", "enabled": true},
      {"id": "ocr-engine", "enabled": true}
    ],
    "memory": {
      "enabled": true,
      "type": "buffer",
      "max_messages": 10
    }
  }
}
```

### Orchestration Spec (YAML)

```yaml
version: "1.0"
app_id: "app-123"
name: "Credit Memo Pipeline"

agents:
  - id: "agent-1"
    name: "Document Extractor"
    type: "extractor"
    
  - id: "agent-2"
    name: "Risk Analyzer"
    type: "analysis"
    
  - id: "agent-3"
    name: "Report Generator"
    type: "summarizer"

workflow:
  - step: 1
    agent_id: "agent-1"
    inputs:
      - source: "trigger"
        field: "document"
    outputs:
      - name: "extracted_data"
        
  - step: 2
    agent_id: "agent-2"
    inputs:
      - source: "agent-1"
        field: "extracted_data"
    outputs:
      - name: "risk_analysis"
      
  - step: 3
    agent_id: "agent-3"
    inputs:
      - source: "agent-2"
        field: "risk_analysis"
    outputs:
      - name: "final_report"
```

---

## Docker Deployment Strategy

### Per-Agent Containerization

Each agent type runs in its own optimized Docker container. This provides:

- **Isolation**: Agents cannot interfere with each other
- **Scalability**: Scale agents independently based on load
- **Security**: Minimal attack surface per container
- **Performance**: Optimized dependencies per agent type

### Base Images

| Image Type | Base | Size | Use Case |
|------------|------|------|----------|
| **Alpine** | `python:3.11-alpine` | ~50MB | Simple agents, minimal dependencies |
| **Slim** | `python:3.11-slim` | ~120MB | Agents with native dependencies |
| **Full** | `python:3.11` | ~900MB | Development, debugging |

### Dockerfile Templates

#### Alpine Base (Recommended for most agents)

```dockerfile
# agents/extractor/Dockerfile
FROM python:3.11-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev libffi-dev

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-alpine

# Runtime dependencies only
RUN apk add --no-cache libffi

# Create non-root user
RUN adduser -D -u 1000 agent
USER agent

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/agent/.local
ENV PATH=/home/agent/.local/bin:$PATH

# Copy agent code
COPY --chown=agent:agent . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8080/health')" || exit 1

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

#### Slim Base (For agents with native libs)

```dockerfile
# agents/ocr-extractor/Dockerfile
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

# Runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN useradd -m -u 1000 agent
USER agent

WORKDIR /app

COPY --from=builder /root/.local /home/agent/.local
ENV PATH=/home/agent/.local/bin:$PATH

COPY --chown=agent:agent . .

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8080/health')" || exit 1

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Agent Image Structure

```
/agents
├── base/
│   ├── Dockerfile.alpine         # Base Alpine image
│   ├── Dockerfile.slim           # Base Slim image
│   └── requirements.base.txt     # Common dependencies
│
├── extractor/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                   # FastAPI agent server
│   ├── agent.py                  # Agent implementation
│   └── tools/
│       ├── pdf_parser.py
│       └── ocr_engine.py
│
├── mapper/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── agent.py
│   └── tools/
│       └── schema_validator.py
│
├── analyzer/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── agent.py
│   └── tools/
│       ├── risk_calculator.py
│       └── market_data.py
│
└── summarizer/
    ├── Dockerfile
    ├── requirements.txt
    ├── main.py
    ├── agent.py
    └── tools/
        └── template_engine.py
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
    depends_on:
      - api

  # Backend API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/agentic_hub
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Agent: Extractor
  agent-extractor:
    build:
      context: ./agents/extractor
      dockerfile: Dockerfile
    ports:
      - "8081:8080"
    environment:
      - AGENT_TYPE=extractor
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # Agent: Mapper
  agent-mapper:
    build:
      context: ./agents/mapper
      dockerfile: Dockerfile
    ports:
      - "8082:8080"
    environment:
      - AGENT_TYPE=mapper
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'

  # Agent: Analyzer
  agent-analyzer:
    build:
      context: ./agents/analyzer
      dockerfile: Dockerfile
    ports:
      - "8083:8080"
    environment:
      - AGENT_TYPE=analyzer
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'

  # Agent: Summarizer
  agent-summarizer:
    build:
      context: ./agents/summarizer
      dockerfile: Dockerfile
    ports:
      - "8084:8080"
    environment:
      - AGENT_TYPE=summarizer
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # Infrastructure
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=agentic_hub
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment (Production)

```yaml
# k8s/agent-extractor-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-extractor
  labels:
    app: agent-extractor
    type: agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-extractor
  template:
    metadata:
      labels:
        app: agent-extractor
    spec:
      containers:
        - name: agent
          image: agentic-hub/agent-extractor:latest
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          env:
            - name: AZURE_OPENAI_ENDPOINT
              valueFrom:
                secretKeyRef:
                  name: azure-openai-secrets
                  key: endpoint
            - name: AZURE_OPENAI_KEY
              valueFrom:
                secretKeyRef:
                  name: azure-openai-secrets
                  key: api-key
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: agent-extractor
spec:
  selector:
    app: agent-extractor
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agent-extractor-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agent-extractor
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Image Size Optimization

| Optimization | Impact |
|--------------|--------|
| Multi-stage builds | 50-70% size reduction |
| Alpine base | 60-80% vs full image |
| `--no-cache-dir` pip | 10-20% reduction |
| Remove build deps | 20-30% reduction |
| `.dockerignore` | 5-10% reduction |

### Agent Image Registry

```
registry.example.com/agentic-hub/
├── agent-base-alpine:1.0.0       # 50MB
├── agent-base-slim:1.0.0         # 120MB
├── agent-extractor:1.2.0         # 85MB
├── agent-mapper:1.1.0            # 65MB
├── agent-analyzer:2.0.0          # 150MB
└── agent-summarizer:1.0.5        # 75MB
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Git

### Frontend Setup

```bash
# Clone repository
git clone https://github.com/org/agentic-hub.git
cd agentic-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload --port 8000
```

### Full Stack with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Environment Variables

```bash
# .env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/agentic_hub
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# MLflow
MLFLOW_TRACKING_URI=http://localhost:5000
MLFLOW_ARTIFACT_ROOT=s3://mlflow-artifacts
```

---

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (RBAC)
3. **Secrets**: Kubernetes secrets or HashiCorp Vault
4. **Network**: Service mesh (Istio) for mTLS
5. **Container Security**: Non-root users, read-only filesystems
6. **API Security**: Rate limiting, input validation, CORS

---

## Monitoring & Observability

- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry + Jaeger
- **Logging**: ELK Stack or Loki
- **Alerting**: PagerDuty or Opsgenie

---

## Next Steps

1. [ ] Implement database persistence (PostgreSQL)
2. [ ] Add authentication (OAuth2/OIDC)
3. [ ] Integrate MLflow for prompt versioning
4. [ ] Build agent Docker images
5. [ ] Set up CI/CD pipeline
6. [ ] Configure Kubernetes deployment
7. [ ] Implement observability stack
