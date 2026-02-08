// Type definitions for the Agentic Hub Platform

export type AppStatus = "Draft" | "Deployed" | "Archived"

export interface IntelligentApp {
  id: string
  name: string
  version: string
  agentCount: number
  status: AppStatus
  lastUpdated: string
  description?: string
}

export type AgentTypeCategory = "Core Intelligence" | "Function" | "Industry"

export type AgentCategory = 
  | "Knowledge & RAG"
  | "Reasoning & Planning"
  | "Finance"
  | "Banking"
  | "Insurance"
  | "Data Processing"
  | "Document Analysis"
  | "Communication"

export type AgentType = "Extractor" | "Mapper" | "Analysis" | "Summarizer"

export interface Agent {
  id: string
  name: string
  type: AgentType
  typeCategory: AgentTypeCategory
  category: AgentCategory
  configVersion: string
  toolsEnabled: string[]
  description?: string
  isExistingAgent?: boolean
  hasAIBuilder?: boolean
}

export interface AgentConfig {
  id: string
  name: string
  type: AgentType
  version: string
  model: {
    provider: string
    name: string
    temperature: number
    maxTokens: number
  }
  prompts: {
    systemPromptUri: string
    taskPromptUri: string
  }
  schemas: {
    inputSchemaUri: string
    outputSchemaUri: string
  }
  tools: Tool[]
  memory: {
    enabled: boolean
    namespace: string
    retentionPolicy: string
  }
}

export interface Tool {
  id: string
  name: string
  enabled: boolean
  deterministic: boolean
  hasSideEffects: boolean
}

export interface PromptArtifact {
  id: string
  name: string
  type: "system" | "task" | "schema"
  version: string
  lastUpdated: string
  content?: string
}

export interface RunRecord {
  id: string
  timestamp: string
  agentName: string
  appName: string
  status: "Success" | "Failed" | "Running"
  latency: number
}

export interface TraceRecord {
  id: string
  input: string
  output: string
  toolCalls: string[]
}

export interface MetricsData {
  tokenUsage: number
  cost: number
  errorRate: number
}

export interface SchemaViolation {
  id: string
  timestamp: string
  agentName: string
  expected: string
  actual: string
}

export interface OrchestrationNode {
  id: string
  agentId: string
  agentName: string
  position: { x: number; y: number }
}

export interface OrchestrationEdge {
  id: string
  source: string
  target: string
}
