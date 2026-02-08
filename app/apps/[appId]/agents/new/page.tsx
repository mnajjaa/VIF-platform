"use client"

import React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Loader2,
  Check,
  Settings2,
  MessageSquare,
  FileJson,
  Wrench,
  AlertTriangle,
  Zap,
} from "lucide-react"
import type { AgentType, AgentCategory, Tool } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { getAvailableTools } from "@/lib/placeholder-data"
import { cn } from "@/lib/utils"

interface WizardStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: "Identity", description: "Basic agent info", icon: <Bot className="h-4 w-4" /> },
  { id: 2, title: "Model", description: "LLM configuration", icon: <Settings2 className="h-4 w-4" /> },
  { id: 3, title: "Prompts", description: "MLflow URIs", icon: <MessageSquare className="h-4 w-4" /> },
  { id: 4, title: "Schemas", description: "Input/Output", icon: <FileJson className="h-4 w-4" /> },
  { id: 5, title: "Tools", description: "Available tools", icon: <Wrench className="h-4 w-4" /> },
]

const AGENT_TYPES: { value: AgentType | "Custom"; label: string; description: string }[] = [
  { value: "Extractor", label: "Extractor", description: "Extract structured data from unstructured sources" },
  { value: "Mapper", label: "Mapper", description: "Transform and map data between formats" },
  { value: "Analysis", label: "Analysis", description: "Analyze data and generate insights" },
  { value: "Summarizer", label: "Summarizer", description: "Summarize and condense information" },
  { value: "Custom", label: "Custom", description: "Define a custom agent type" },
]

const CATEGORIES: { value: AgentCategory; label: string }[] = [
  { value: "Knowledge & RAG", label: "Knowledge & RAG" },
  { value: "Reasoning & Planning", label: "Reasoning & Planning" },
  { value: "Finance", label: "Finance" },
  { value: "Banking", label: "Banking" },
  { value: "Insurance", label: "Insurance" },
  { value: "Data Processing", label: "Data Processing" },
  { value: "Document Analysis", label: "Document Analysis" },
  { value: "Communication", label: "Communication" },
]

const PROVIDERS = [
  { value: "azure-openai", label: "Azure OpenAI" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google Vertex AI" },
  { value: "aws-bedrock", label: "AWS Bedrock" },
]

const MODELS: Record<string, { value: string; label: string }[]> = {
  "azure-openai": [
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  ],
  openai: [
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  ],
  anthropic: [
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  ],
  google: [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
  "aws-bedrock": [
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "titan-text", label: "Amazon Titan Text" },
  ],
}

export default function NewAgentPage() {
  const params = useParams<{ appId: string }>()
  const appId = params.appId
  const router = useRouter()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [creating, setCreating] = useState(false)

  // Step 1: Identity
  const [name, setName] = useState("")
  const [agentType, setAgentType] = useState<AgentType | "Custom" | "">("")
  const [category, setCategory] = useState<AgentCategory | "">("")
  const [description, setDescription] = useState("")

  // Step 2: Model Configuration
  const [provider, setProvider] = useState("")
  const [model, setModel] = useState("")
  const [temperature, setTemperature] = useState(0.1)
  const [maxTokens, setMaxTokens] = useState(4096)

  // Step 3: Prompts
  const [systemPromptUri, setSystemPromptUri] = useState("")
  const [taskPromptUri, setTaskPromptUri] = useState("")

  // Step 4: Schemas
  const [inputSchemaUri, setInputSchemaUri] = useState("")
  const [outputSchemaUri, setOutputSchemaUri] = useState("")

  // Step 5: Tools
  const [tools, setTools] = useState<Tool[]>(getAvailableTools())

  const toggleTool = (toolId: string) => {
    setTools(tools.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t)))
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!name && !!agentType && !!category
      case 2:
        return !!provider && !!model
      case 3:
        return !!systemPromptUri && !!taskPromptUri
      case 4:
        return !!inputSchemaUri && !!outputSchemaUri
      case 5:
        return true // Tools are optional
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 5 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateYamlConfig = () => {
    const enabledTools = tools.filter((t) => t.enabled).map((t) => t.name)
    return `agent:
  name: "${name}"
  type: "${agentType}"
  category: "${category}"
  description: "${description}"

model:
  provider: "${provider}"
  name: "${model}"
  temperature: ${temperature}
  max_tokens: ${maxTokens}

prompts:
  system_prompt_uri: "${systemPromptUri}"
  task_prompt_uri: "${taskPromptUri}"

schemas:
  input_schema_uri: "${inputSchemaUri}"
  output_schema_uri: "${outputSchemaUri}"

tools:
${enabledTools.map((t) => `  - ${t}`).join("\n") || "  []"}

memory:
  enabled: true
  namespace: "${name.toLowerCase().replace(/\s+/g, "-")}-memory"
  retention_policy: "30d"`
  }

  const handleCreate = async () => {
    if (!isStepValid(currentStep)) return
    setCreating(true)
    try {
      // Simulate API call to create agent with full config
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newAgentId = `agent-${Date.now()}`

      toast({
        title: "Agent created successfully",
        description: "Your new agent has been configured and attached to the application.",
      })

      // Redirect to orchestration screen
      router.push(`/apps/${appId}?tab=orchestration`)
    } catch {
      toast({
        title: "Error creating agent",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Agent Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Credit Memo Analyzer"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground">
                Agent Type <span className="text-destructive">*</span>
              </Label>
              <Select value={agentType} onValueChange={(value) => setAgentType(value as AgentType | "Custom")}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as AgentCategory)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose and functionality of this agent"
                className="bg-input border-border resize-none"
                rows={3}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-foreground">
                Provider <span className="text-destructive">*</span>
              </Label>
              <Select
                value={provider}
                onValueChange={(value) => {
                  setProvider(value)
                  setModel("") // Reset model when provider changes
                }}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-foreground">
                Model Name <span className="text-destructive">*</span>
              </Label>
              <Select value={model} onValueChange={setModel} disabled={!provider}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder={provider ? "Select model" : "Select provider first"} />
                </SelectTrigger>
                <SelectContent>
                  {provider &&
                    MODELS[provider]?.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Temperature</Label>
                  <span className="text-sm text-muted-foreground">{temperature.toFixed(2)}</span>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={([value]) => setTemperature(value)}
                  min={0}
                  max={2}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Lower values produce more focused, deterministic outputs. Higher values increase creativity.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Max Tokens</Label>
                  <span className="text-sm text-muted-foreground">{maxTokens.toLocaleString()}</span>
                </div>
                <Slider
                  value={[maxTokens]}
                  onValueChange={([value]) => setMaxTokens(value)}
                  min={256}
                  max={128000}
                  step={256}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Maximum number of tokens in the model response.</p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 mb-6">
              <div className="flex gap-3">
                <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Prompts are managed in MLflow</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All prompts are stored and versioned in MLflow. No prompt content is stored directly in agent
                    configuration.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPromptUri" className="text-foreground">
                System Prompt URI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="systemPromptUri"
                value={systemPromptUri}
                onChange={(e) => setSystemPromptUri(e.target.value)}
                placeholder="mlflow://prompts/my-agent/system/v1.0"
                className="bg-input border-border font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">MLflow URI pointing to the system prompt artifact</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskPromptUri" className="text-foreground">
                Task Prompt URI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="taskPromptUri"
                value={taskPromptUri}
                onChange={(e) => setTaskPromptUri(e.target.value)}
                placeholder="mlflow://prompts/my-agent/task/v1.0"
                className="bg-input border-border font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">MLflow URI pointing to the task prompt artifact</p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-muted/50 border border-border p-4 mb-6">
              <div className="flex gap-3">
                <FileJson className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">JSON Schema Validation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define input and output schemas to ensure type safety and enable runtime validation of agent
                    responses.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inputSchemaUri" className="text-foreground">
                Input JSONSchema URI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="inputSchemaUri"
                value={inputSchemaUri}
                onChange={(e) => setInputSchemaUri(e.target.value)}
                placeholder="mlflow://schemas/my-agent/input/v1.0"
                className="bg-input border-border font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">URI pointing to the input validation schema</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outputSchemaUri" className="text-foreground">
                Output JSONSchema URI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="outputSchemaUri"
                value={outputSchemaUri}
                onChange={(e) => setOutputSchemaUri(e.target.value)}
                placeholder="mlflow://schemas/my-agent/output/v1.0"
                className="bg-input border-border font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">URI pointing to the output validation schema</p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Enable the tools this agent can use during execution. Tool availability affects the agent&apos;s
              capabilities.
            </p>

            <div className="space-y-3">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    tool.enabled ? "bg-primary/5 border-primary/30" : "bg-card border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Switch checked={tool.enabled} onCheckedChange={() => toggleTool(tool.id)} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{tool.name}</span>
                        <div className="flex gap-1">
                          {tool.deterministic && (
                            <Badge variant="outline" className="text-xs bg-transparent">
                              <Check className="h-3 w-3 mr-1" />
                              Deterministic
                            </Badge>
                          )}
                          {tool.hasSideEffects && (
                            <Badge variant="outline" className="text-xs bg-warning/15 text-warning border-warning/30">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Side Effects
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {tool.enabled && <Zap className="h-4 w-4 text-primary" />}
                </div>
              ))}
            </div>

            {/* Generated Config Preview */}
            <div className="mt-8">
              <Label className="text-foreground mb-3 block">Generated Configuration Preview</Label>
              <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground font-medium">agent-config.yaml</span>
                </div>
                <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto max-h-64 overflow-y-auto">
                  {generateYamlConfig()}
                </pre>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/apps/${appId}/onboarding`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Create New Agent</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure your AI agent step by step</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  // Allow clicking on completed steps to go back
                  if (step.id < currentStep) {
                    setCurrentStep(step.id)
                  }
                }}
                disabled={step.id > currentStep}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : step.id < currentStep
                      ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                      : "bg-muted text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                    currentStep === step.id
                      ? "bg-primary-foreground/20"
                      : step.id < currentStep
                        ? "bg-primary/30"
                        : "bg-muted-foreground/20"
                  )}
                >
                  {step.id < currentStep ? <Check className="h-3 w-3" /> : step.id}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{step.title}</div>
                </div>
              </button>
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block w-8 h-0.5 mx-2",
                    step.id < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                {WIZARD_STEPS[currentStep - 1].icon}
              </div>
              <div>
                <CardTitle className="text-lg">
                  Step {currentStep}: {WIZARD_STEPS[currentStep - 1].title}
                </CardTitle>
                <CardDescription>{WIZARD_STEPS[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || creating}
            className="gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/apps/${appId}/onboarding`)}
              disabled={creating}
              className="bg-transparent"
            >
              Cancel
            </Button>

            {currentStep < 5 ? (
              <Button onClick={handleNext} disabled={!isStepValid(currentStep)} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={creating} className="gap-2">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Create Agent
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
