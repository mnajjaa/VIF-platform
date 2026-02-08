"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Rocket, Archive, Eye } from "lucide-react"
import type { IntelligentApp } from "@/lib/types"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"

interface AppCardProps {
  app: IntelligentApp
  onView?: () => void
  onDeploy?: () => void
  onArchive?: () => void
  className?: string
}

export function AppCard({ app, onView, onDeploy, onArchive, className }: AppCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">{app.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={app.status} />
              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                v{app.version}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bot className="h-4 w-4" />
            <span className="text-sm font-medium">{app.agentCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {app.description && (
          <CardDescription className="text-muted-foreground mb-4">
            {app.description}
          </CardDescription>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Updated {formatDate(app.lastUpdated)}
          </span>
          <div className="flex items-center gap-1">
            {onView && (
              <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onView}>
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
            )}
            {onDeploy && app.status !== "Deployed" && (
              <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onDeploy}>
                <Rocket className="h-3.5 w-3.5" />
                Deploy
              </Button>
            )}
            {onArchive && app.status !== "Archived" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-destructive hover:text-destructive"
                onClick={onArchive}
              >
                <Archive className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
