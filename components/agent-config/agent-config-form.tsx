"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Save, RotateCcw, CheckCircle, AlertTriangle, Zap, Loader2, X } from "lucide-react"
import type { AgentConfig } from "@/lib/types"
import { agentsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AgentConfigFormProps {
  config: AgentConfig
}

export function AgentConfigForm({ config }: AgentConfigFormProps) {
  const { toast } = useToast()
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [temperature, setTemperature] = useState(config.model.temperature)
  const [maxTokens, setMaxTokens] = useState(config.model.maxTokens)
  const [tools, setTools] = useState(config.tools)
  const [memoryEnabled, setMemoryEnabled] = useState(config.memory.enabled)

  const toggleTool = (toolId: string) => {
    setTools(tools.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t)))
  }

  const handleValidate = async () => {
    setValidating(true)
    try {
      // Simulate validation
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast({
        title: "Configuration valid",
        description: "All configuration settings passed validation.",
      })
    } catch {
      toast({
        title: "Validation failed",
        description: "Some configuration settings are invalid.",
        variant: "destructive",
      })
    } finally {
      setValidating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await agentsApi.updateConfig(config.id, {
        model: {
          ...config.model,
          temperature,
          maxTokens,
        },
        tools,
        memory: {
          ...config.memory,
          enabled: memoryEnabled,
        },
      })
      if (response.success) {
        toast({
          title: "Configuration saved",
          description: "Agent configuration has been updated successfully.",
        })
        setEditMode(false)
      }
    } catch {
      toast({
        title: "Save failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTemperature(config.model.temperature)
    setMaxTokens(config.model.maxTokens)
    setTools(config.tools)
    setMemoryEnabled(config.memory.enabled)
    setEditMode(false)
  }

  const handleRollback = () => {
    toast({
      title: "Rollback initiated",
      description: "Rolling back to previous configuration version...",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{config.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{config.type}</Badge>
            <span className="text-sm text-muted-foreground">v{config.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>Edit Configuration</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving} className="gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={handleRollback} disabled={saving}>
                <RotateCcw className="h-4 w-4" />
                Rollback
              </Button>
              <Button className="gap-2 bg-transparent" variant="outline" onClick={handleValidate} disabled={saving || validating}>
                {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Validate
              </Button>
              <Button className="gap-2" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Model Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Model Configuration</CardTitle>
            <CardDescription className="text-muted-foreground">Configure the underlying LLM model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-foreground">Provider</Label>
              <Select defaultValue={config.model.provider} disabled={!editMode}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                  <SelectItem value="Anthropic">Anthropic</SelectItem>
                  <SelectItem value="Azure">Azure OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Model Name</Label>
              <Select defaultValue={config.model.name} disabled={!editMode}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Temperature</Label>
                <span className="text-sm text-muted-foreground">{temperature}</span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={(v) => setTemperature(v[0])}
                max={2}
                step={0.1}
                disabled={!editMode}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Max Tokens</Label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="bg-input border-border"
                disabled={!editMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prompt Artifacts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Prompt Artifacts (MLflow)</CardTitle>
            <CardDescription className="text-muted-foreground">
              Reference MLflow-stored prompt artifacts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-foreground">System Prompt URI</Label>
              <Input
                value={config.prompts.systemPromptUri}
                className="bg-input border-border font-mono text-sm"
                disabled={!editMode}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Task Prompt URI</Label>
              <Input
                value={config.prompts.taskPromptUri}
                className="bg-input border-border font-mono text-sm"
                disabled={!editMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schemas */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Schemas</CardTitle>
            <CardDescription className="text-muted-foreground">Input and output JSONSchema definitions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-foreground">Input JSONSchema URI</Label>
              <Input
                value={config.schemas.inputSchemaUri}
                className="bg-input border-border font-mono text-sm"
                disabled={!editMode}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Output JSONSchema URI</Label>
              <Input
                value={config.schemas.outputSchemaUri}
                className="bg-input border-border font-mono text-sm"
                disabled={!editMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Memory (MMS) */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Memory (MMS)</CardTitle>
            <CardDescription className="text-muted-foreground">Configure agent memory settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Enable Memory</Label>
              <Switch checked={memoryEnabled} onCheckedChange={setMemoryEnabled} disabled={!editMode} />
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Memory Namespace</Label>
              <Input
                value={config.memory.namespace}
                className="bg-input border-border font-mono text-sm"
                disabled={!editMode || !memoryEnabled}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Retention Policy</Label>
              <Select defaultValue={config.memory.retentionPolicy} disabled={!editMode || !memoryEnabled}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Tools</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enable or disable available tools for this agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`p-3 rounded-lg border transition-colors ${
                  tool.enabled ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{tool.name}</span>
                  <Switch checked={tool.enabled} onCheckedChange={() => toggleTool(tool.id)} disabled={!editMode} />
                </div>
                <div className="flex items-center gap-2">
                  {tool.deterministic ? (
                    <Badge variant="outline" className="text-xs gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Deterministic
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Zap className="h-3 w-3" />
                      Non-deterministic
                    </Badge>
                  )}
                  {tool.hasSideEffects && (
                    <Badge variant="outline" className="text-xs gap-1 text-warning border-warning/30">
                      <AlertTriangle className="h-3 w-3" />
                      Side effects
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
