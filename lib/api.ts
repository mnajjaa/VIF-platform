// Centralized mock API layer
// Ready to plug into FastAPI backend later

import type {
  IntelligentApp,
  Agent,
  AgentConfig,
  PromptArtifact,
  RunRecord,
  SchemaViolation,
  Tool,
} from "./types"
import {
  getIntelligentApps,
  getAgentsForApp,
  getAgentConfig,
  getPromptArtifacts,
  getRunRecords,
  getSchemaViolations,
  getAvailableTools,
  getConfigTemplates,
  getAgentLibrary,
} from "./placeholder-data"

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// API Response type
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Apps API
export const appsApi = {
  async list(): Promise<ApiResponse<IntelligentApp[]>> {
    await delay(300)
    return { data: getIntelligentApps(), error: null, success: true }
  },

  async get(id: string): Promise<ApiResponse<IntelligentApp | null>> {
    await delay(200)
    const apps = getIntelligentApps()
    const app = apps.find((a) => a.id === id) || null
    return { data: app, error: app ? null : "App not found", success: !!app }
  },

  async create(data: { name: string; description: string }): Promise<ApiResponse<IntelligentApp>> {
    await delay(500)
    const newApp: IntelligentApp = {
      id: `app-${Date.now()}`,
      name: data.name,
      description: data.description,
      version: "0.1.0",
      agentCount: 0,
      status: "Draft",
      lastUpdated: new Date().toISOString(),
    }
    return { data: newApp, error: null, success: true }
  },

  async update(id: string, data: Partial<IntelligentApp>): Promise<ApiResponse<IntelligentApp>> {
    await delay(400)
    const apps = getIntelligentApps()
    const app = apps.find((a) => a.id === id)
    if (!app) return { data: null, error: "App not found", success: false }
    return { data: { ...app, ...data }, error: null, success: true }
  },

  async deploy(id: string): Promise<ApiResponse<{ status: string }>> {
    await delay(800)
    return { data: { status: "Deployed" }, error: null, success: true }
  },

  async archive(id: string): Promise<ApiResponse<{ status: string }>> {
    await delay(400)
    return { data: { status: "Archived" }, error: null, success: true }
  },
}

// Agents API
export const agentsApi = {
  async listForApp(appId: string): Promise<ApiResponse<Agent[]>> {
    await delay(300)
    return { data: getAgentsForApp(appId), error: null, success: true }
  },

  async listAll(): Promise<ApiResponse<Agent[]>> {
    await delay(300)
    // Return all unique agents across apps
    const allAgents = getAgentsForApp("all")
    return { data: allAgents, error: null, success: true }
  },

  async listLibrary(): Promise<ApiResponse<Agent[]>> {
    await delay(300)
    return { data: getAgentLibrary(), error: null, success: true }
  },

  async get(id: string): Promise<ApiResponse<Agent | null>> {
    await delay(200)
    const agents = getAgentsForApp("all")
    const agent = agents.find((a) => a.id === id) || null
    return { data: agent, error: agent ? null : "Agent not found", success: !!agent }
  },

  async getConfig(id: string): Promise<ApiResponse<AgentConfig>> {
    await delay(300)
    return { data: getAgentConfig(id), error: null, success: true }
  },

  async updateConfig(id: string, config: Partial<AgentConfig>): Promise<ApiResponse<AgentConfig>> {
    await delay(500)
    const currentConfig = getAgentConfig(id)
    return { data: { ...currentConfig, ...config }, error: null, success: true }
  },

  async addToApp(appId: string, agentId: string): Promise<ApiResponse<{ success: boolean }>> {
    await delay(400)
    return { data: { success: true }, error: null, success: true }
  },

  async removeFromApp(appId: string, agentId: string): Promise<ApiResponse<{ success: boolean }>> {
    await delay(400)
    return { data: { success: true }, error: null, success: true }
  },
}

// Tools API
export const toolsApi = {
  async list(): Promise<ApiResponse<Tool[]>> {
    await delay(200)
    return { data: getAvailableTools(), error: null, success: true }
  },
}

// Orchestration API
export const orchestrationApi = {
  async getForApp(appId: string): Promise<ApiResponse<{ nodes: any[]; edges: any[] }>> {
    await delay(300)
    const agents = getAgentsForApp(appId)
    const nodes = agents.map((a, i) => ({
      id: a.id,
      agentId: a.id,
      agentName: a.name,
      position: { x: 100 + i * 200, y: 250 + (i % 2 === 0 ? -30 : 30) },
    }))
    const edges = agents.slice(0, -1).map((a, i) => ({
      id: `edge-${i}`,
      source: a.id,
      target: agents[i + 1].id,
    }))
    return { data: { nodes, edges }, error: null, success: true }
  },

  async validate(appId: string): Promise<ApiResponse<{ valid: boolean; errors: string[] }>> {
    await delay(600)
    return { data: { valid: true, errors: [] }, error: null, success: true }
  },
}

// Prompts API
export const promptsApi = {
  async list(): Promise<ApiResponse<PromptArtifact[]>> {
    await delay(300)
    return { data: getPromptArtifacts(), error: null, success: true }
  },

  async get(id: string): Promise<ApiResponse<PromptArtifact | null>> {
    await delay(200)
    const artifacts = getPromptArtifacts()
    const artifact = artifacts.find((a) => a.id === id) || null
    return { data: artifact, error: artifact ? null : "Artifact not found", success: !!artifact }
  },

  async getVersions(id: string): Promise<ApiResponse<string[]>> {
    await delay(200)
    return { data: ["1.2.0", "1.1.0", "1.0.0"], error: null, success: true }
  },
}

// Observability API
export const observabilityApi = {
  async getRuns(filters?: { appId?: string; agentId?: string }): Promise<ApiResponse<RunRecord[]>> {
    await delay(400)
    let runs = getRunRecords()
    if (filters?.appId) {
      runs = runs.filter((r) => r.appName.toLowerCase().includes(filters.appId!.toLowerCase()))
    }
    return { data: runs, error: null, success: true }
  },

  async getViolations(): Promise<ApiResponse<SchemaViolation[]>> {
    await delay(300)
    return { data: getSchemaViolations(), error: null, success: true }
  },

  async getMetrics(): Promise<ApiResponse<{
    totalRuns: number
    avgLatency: number
    errorRate: number
    tokenUsage: number
    estimatedCost: number
  }>> {
    await delay(400)
    return {
      data: {
        totalRuns: 12847,
        avgLatency: 1.2,
        errorRate: 1.8,
        tokenUsage: 2400000,
        estimatedCost: 487,
      },
      error: null,
      success: true,
    }
  },
}

// Config Templates API
export const templatesApi = {
  async list(): Promise<ApiResponse<{ id: string; name: string; type: string }[]>> {
    await delay(200)
    return { data: getConfigTemplates(), error: null, success: true }
  },
}
