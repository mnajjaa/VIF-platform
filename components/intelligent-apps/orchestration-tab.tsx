"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, AlertTriangle, CheckCircle, Loader2, Eye } from "lucide-react"
import type { Agent } from "@/lib/types"
import { OrchestrationGraph } from "./orchestration-graph"
import { YAMLConfigEditor } from "@/components/shared/yaml-config-editor"
import { orchestrationApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface OrchestrationTabProps {
  agents: Agent[]
  appId?: string
}

export function OrchestrationTab({ agents, appId }: OrchestrationTabProps) {
  const { toast } = useToast()
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    errors: string[]
  } | null>(null)

  const selectedAgent = selectedNode ? agents.find((a) => a.id === selectedNode) : null

  const handleValidate = async () => {
    if (!appId) return
    setValidating(true)
    try {
      const response = await orchestrationApi.validate(appId)
      if (response.success && response.data) {
        setValidationResult(response.data)
        toast({
          title: response.data.valid ? "Validation passed" : "Validation failed",
          description: response.data.valid
            ? "Orchestration configuration is valid."
            : `Found ${response.data.errors.length} error(s).`,
          variant: response.data.valid ? "default" : "destructive",
        })
      }
    } catch {
      toast({
        title: "Validation failed",
        description: "Unable to validate orchestration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setValidating(false)
    }
  }

  // Generate sample orchestration spec
  const orchestrationSpec = `# Orchestration Specification
# Auto-generated - Read Only

version: "1.0"
name: "trade-analysis-pipeline"

nodes:
${agents
  .map(
    (a, i) => `  - id: "${a.id}"
    agent: "${a.name}"
    type: "${a.type}"`,
  )
  .join("\n")}

edges:
${agents
  .slice(0, -1)
  .map(
    (a, i) => `  - source: "${a.id}"
    target: "${agents[i + 1].id}"`,
  )
  .join("\n")}

execution:
  mode: sequential
  error_handling: fail_fast
  retry_policy:
    max_retries: 3
    backoff: exponential
`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Orchestration Builder</h3>
          <p className="text-sm text-muted-foreground">Visually orchestrate agent execution flow</p>
        </div>
        <div className="flex items-center gap-2">
          {validationResult && (
            <Badge
              variant="outline"
              className={
                validationResult.valid
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-destructive/15 text-destructive border-destructive/30"
              }
            >
              {validationResult.valid ? (
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              )}
              {validationResult.valid ? "Valid" : `${validationResult.errors.length} Error(s)`}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={validating || agents.length === 0}
            className="gap-2 bg-transparent"
          >
            {validating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Validate
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-[500px]">
            <CardContent className="p-0 h-full">
              <OrchestrationGraph agents={agents} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm">Execution Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedNode === agent.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedNode(agent.id)}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground">{agent.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedAgent && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-sm">Selected Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{selectedAgent.name}</div>
                  <Badge variant="outline" className="mt-1">
                    {selectedAgent.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">Config: v{selectedAgent.configVersion}</div>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.toolsEnabled.map((tool) => (
                    <Badge key={tool} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm flex items-center gap-2">
                <Code className="h-4 w-4" />
                Conditional Routing
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Define conditional branches based on agent outputs and runtime context.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Generated Orchestration Spec
            </CardTitle>
            <Badge variant="outline">Read Only</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-muted text-sm text-muted-foreground overflow-auto font-mono">
            {orchestrationSpec}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
