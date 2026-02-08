# Agentic Hub Platform - API Reference

## Base URL

```
Production: https://api.agentic-hub.example.com/v1
Development: http://localhost:8000
```

## Authentication

All API requests require a Bearer token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

---

## Applications API

### List Applications

```http
GET /apps
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `draft`, `deployed`, `archived` |
| `limit` | integer | Max results (default: 50, max: 100) |
| `offset` | integer | Pagination offset |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "app-123",
      "name": "Credit Memo Processor",
      "description": "Automated credit analysis",
      "version": "1.2.0",
      "status": "deployed",
      "agent_count": 4,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-22T14:30:00Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

---

### Create Application

```http
POST /apps
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Loan Underwriting Pipeline",
  "description": "AI-powered loan document processing"
}
```

**Response:** `201 Created`

```json
{
  "id": "app-456",
  "name": "Loan Underwriting Pipeline",
  "description": "AI-powered loan document processing",
  "version": "1.0.0",
  "status": "draft",
  "agent_count": 0,
  "created_at": "2026-01-22T15:00:00Z",
  "updated_at": "2026-01-22T15:00:00Z"
}
```

---

### Get Application

```http
GET /apps/{app_id}
```

**Response:** `200 OK`

```json
{
  "id": "app-123",
  "name": "Credit Memo Processor",
  "description": "Automated credit analysis",
  "version": "1.2.0",
  "status": "deployed",
  "agent_count": 4,
  "agents": [
    {
      "id": "agent-1",
      "name": "Document Extractor",
      "type": "extractor",
      "config_version": "1.2.0"
    }
  ],
  "orchestration": {
    "workflow": [...],
    "last_validated": "2026-01-22T14:00:00Z"
  },
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-22T14:30:00Z"
}
```

---

### Update Application

```http
PATCH /apps/{app_id}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:** `200 OK`

---

### Delete Application

```http
DELETE /apps/{app_id}
```

**Response:** `204 No Content`

---

### Deploy Application

```http
POST /apps/{app_id}/deploy
```

**Response:** `200 OK`

```json
{
  "id": "app-123",
  "status": "deployed",
  "deployed_at": "2026-01-22T15:30:00Z",
  "deployment_id": "deploy-789"
}
```

---

### Archive Application

```http
POST /apps/{app_id}/archive
```

**Response:** `200 OK`

```json
{
  "id": "app-123",
  "status": "archived",
  "archived_at": "2026-01-22T16:00:00Z"
}
```

---

## Agents API

### List Agent Library

```http
GET /agents/library
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type_category` | string | `core_intelligence`, `function`, `industry` |
| `category` | string | `knowledge_rag`, `finance`, `banking`, etc. |
| `is_existing_agent` | boolean | Filter by existing agent status |
| `search` | string | Search by name or description |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "lib-agent-1",
      "name": "Enterprise RAG Agent",
      "type": "extractor",
      "type_category": "core_intelligence",
      "category": "knowledge_rag",
      "description": "Advanced RAG for enterprise knowledge bases",
      "config_version": "2.0.0",
      "tools_enabled": ["vector-search", "embeddings"],
      "is_existing_agent": true,
      "has_ai_builder": true
    }
  ],
  "total": 25
}
```

---

### Add Agent to Application

```http
POST /apps/{app_id}/agents
Content-Type: application/json
```

**Request Body (from library):**

```json
{
  "library_agent_id": "lib-agent-1"
}
```

**Request Body (new agent):**

```json
{
  "name": "Custom Analyzer",
  "type": "analysis",
  "type_category": "function",
  "category": "data_processing",
  "description": "Custom data analysis agent",
  "config": {
    "model": {
      "provider": "azure_openai",
      "model_name": "gpt-4o",
      "temperature": 0.3,
      "max_tokens": 4096
    },
    "prompts": {
      "system_prompt_uri": "mlflow:/prompts/analyzer-system-v1",
      "task_prompt_uri": "mlflow:/prompts/analyzer-task-v1"
    },
    "schemas": {
      "input_schema_uri": "s3://schemas/analyzer-input.json",
      "output_schema_uri": "s3://schemas/analyzer-output.json"
    },
    "tools": [
      {"id": "data-validator", "enabled": true}
    ],
    "memory": {
      "enabled": true,
      "type": "buffer",
      "max_messages": 10
    }
  }
}
```

**Response:** `201 Created`

---

### Get Agent Configuration

```http
GET /agents/{agent_id}/config
```

**Response:** `200 OK`

```json
{
  "id": "agent-1",
  "name": "Document Extractor",
  "version": "1.2.0",
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
      {
        "id": "pdf-parser",
        "name": "PDF Parser",
        "enabled": true,
        "is_deterministic": true,
        "has_side_effects": false
      },
      {
        "id": "ocr-engine",
        "name": "OCR Engine",
        "enabled": true,
        "is_deterministic": false,
        "has_side_effects": false
      }
    ],
    "memory": {
      "enabled": true,
      "type": "buffer",
      "max_messages": 10
    }
  }
}
```

---

### Update Agent Configuration

```http
PUT /agents/{agent_id}/config
Content-Type: application/json
```

**Request Body:**

```json
{
  "model": {
    "temperature": 0.5,
    "max_tokens": 8192
  },
  "tools": [
    {"id": "pdf-parser", "enabled": true},
    {"id": "ocr-engine", "enabled": false}
  ]
}
```

**Response:** `200 OK`

---

### Validate Agent Configuration

```http
POST /agents/{agent_id}/validate
```

**Response:** `200 OK`

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "code": "PROMPT_VERSION_OLD",
      "message": "System prompt uses version v1, latest is v2"
    }
  ]
}
```

---

## Orchestration API

### Get Orchestration

```http
GET /orchestration/{app_id}
```

**Response:** `200 OK`

```json
{
  "app_id": "app-123",
  "version": "1.0.0",
  "workflow": [
    {
      "step": 1,
      "agent_id": "agent-1",
      "agent_name": "Document Extractor",
      "inputs": [
        {"source": "trigger", "field": "document"}
      ],
      "outputs": [
        {"name": "extracted_data"}
      ]
    },
    {
      "step": 2,
      "agent_id": "agent-2",
      "agent_name": "Risk Analyzer",
      "inputs": [
        {"source": "agent-1", "field": "extracted_data"}
      ],
      "outputs": [
        {"name": "risk_analysis"}
      ]
    }
  ],
  "last_modified": "2026-01-22T14:00:00Z"
}
```

---

### Update Orchestration

```http
PUT /orchestration/{app_id}
Content-Type: application/json
```

**Request Body:**

```json
{
  "workflow": [
    {
      "step": 1,
      "agent_id": "agent-1",
      "inputs": [{"source": "trigger", "field": "document"}],
      "outputs": [{"name": "extracted_data"}]
    },
    {
      "step": 2,
      "agent_id": "agent-3",
      "inputs": [{"source": "agent-1", "field": "extracted_data"}],
      "outputs": [{"name": "summary"}]
    }
  ]
}
```

**Response:** `200 OK`

---

### Validate Orchestration

```http
POST /orchestration/{app_id}/validate
```

**Response:** `200 OK`

```json
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

**Response (with errors):** `200 OK`

```json
{
  "valid": false,
  "errors": [
    {
      "code": "CIRCULAR_DEPENDENCY",
      "message": "Circular dependency detected: agent-1 -> agent-2 -> agent-1",
      "agents": ["agent-1", "agent-2"]
    },
    {
      "code": "MISSING_INPUT",
      "message": "Agent 'agent-3' references undefined input 'missing_field'",
      "agent_id": "agent-3"
    }
  ],
  "warnings": []
}
```

---

### Export YAML Spec

```http
GET /orchestration/{app_id}/export-yaml
```

**Response:** `200 OK` (Content-Type: text/yaml)

```yaml
version: "1.0"
app_id: "app-123"
name: "Credit Memo Processor"

agents:
  - id: "agent-1"
    name: "Document Extractor"
    type: "extractor"
    config_version: "1.2.0"
    
  - id: "agent-2"
    name: "Risk Analyzer"
    type: "analysis"
    config_version: "2.0.0"

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
```

---

## Observability API

### List Runs

```http
GET /observability/runs
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `app_id` | string | Filter by application |
| `agent_id` | string | Filter by agent |
| `status` | string | `running`, `completed`, `failed` |
| `start_time` | datetime | Start of time range |
| `end_time` | datetime | End of time range |
| `limit` | integer | Max results |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "run-123",
      "app_id": "app-123",
      "status": "completed",
      "duration_ms": 2340,
      "tokens_used": 1250,
      "agents_executed": ["agent-1", "agent-2"],
      "started_at": "2026-01-22T14:00:00Z",
      "completed_at": "2026-01-22T14:00:02.340Z"
    }
  ],
  "total": 1250
}
```

---

### Get Run Traces

```http
GET /observability/traces/{run_id}
```

**Response:** `200 OK`

```json
{
  "run_id": "run-123",
  "traces": [
    {
      "span_id": "span-1",
      "agent_id": "agent-1",
      "agent_name": "Document Extractor",
      "started_at": "2026-01-22T14:00:00.000Z",
      "ended_at": "2026-01-22T14:00:01.200Z",
      "duration_ms": 1200,
      "status": "success",
      "input_tokens": 500,
      "output_tokens": 250,
      "model": "gpt-4o",
      "tools_used": ["pdf-parser"]
    },
    {
      "span_id": "span-2",
      "agent_id": "agent-2",
      "agent_name": "Risk Analyzer",
      "started_at": "2026-01-22T14:00:01.200Z",
      "ended_at": "2026-01-22T14:00:02.340Z",
      "duration_ms": 1140,
      "status": "success",
      "input_tokens": 300,
      "output_tokens": 200,
      "model": "gpt-4o",
      "tools_used": ["risk-calculator"]
    }
  ]
}
```

---

### Get Metrics

```http
GET /observability/metrics
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `app_id` | string | Filter by application |
| `period` | string | `hour`, `day`, `week`, `month` |

**Response:** `200 OK`

```json
{
  "total_runs": 12847,
  "avg_latency_ms": 1240,
  "error_rate": 1.8,
  "token_usage": 2400000,
  "estimated_cost_usd": 487.50,
  "period": "month",
  "trends": {
    "runs": "+18%",
    "latency": "-8%",
    "errors": "-0.3%"
  }
}
```

---

### List Schema Violations

```http
GET /observability/violations
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `app_id` | string | Filter by application |
| `agent_id` | string | Filter by agent |
| `severity` | string | `error`, `warning` |
| `limit` | integer | Max results |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "violation-1",
      "run_id": "run-456",
      "agent_id": "agent-2",
      "agent_name": "Risk Analyzer",
      "severity": "error",
      "schema_type": "output",
      "field": "risk_score",
      "message": "Expected number, got string",
      "occurred_at": "2026-01-22T13:45:00Z"
    }
  ],
  "total": 23
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Application with ID 'app-999' not found",
    "details": {
      "resource_type": "application",
      "resource_id": "app-999"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource state conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint Category | Limit |
|-------------------|-------|
| Read operations | 1000 req/min |
| Write operations | 100 req/min |
| Agent execution | 50 req/min |

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1706018400
```
