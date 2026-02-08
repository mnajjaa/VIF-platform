"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, Settings, Trash2 } from "lucide-react"
import type { Agent } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AgentCardProps {
  agent: Agent
  onConfigure?: () => void
  onRemove?: () => void
  selected?: boolean
  className?: string
}

const typeColors: Record<Agent["type"], string> = {
  Extractor: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  Mapper: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Analysis: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Summarizer: "bg-chart-5/20 text-chart-5 border-chart-5/30",
}

const typeIconColors: Record<Agent["type"], string> = {
  Extractor: "#4ade80",
  Mapper: "#60a5fa",
  Analysis: "#f59e0b",
  Summarizer: "#a78bfa",
}

export function AgentCard({ agent, onConfigure, onRemove, selected, className }: AgentCardProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border transition-all",
        selected && "ring-2 ring-primary",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: typeIconColors[agent.type] + "20" }}
            >
              <Bot className="h-5 w-5" style={{ color: typeIconColors[agent.type] }} />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">{agent.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={typeColors[agent.type]}>
                  {agent.type}
                </Badge>
                <code className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                  v{agent.configVersion}
                </code>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {agent.description && (
          <CardDescription className="text-muted-foreground mb-3">
            {agent.description}
          </CardDescription>
        )}
        <div className="flex flex-wrap gap-1 mb-4">
          {agent.toolsEnabled.map((tool) => (
            <Badge key={tool} variant="secondary" className="text-xs">
              {tool}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {onConfigure && (
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={onConfigure}>
              <Settings className="h-3.5 w-3.5" />
              Configure
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
