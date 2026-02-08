"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "success" | "warning" | "error" | "info" | "neutral"

interface StatusBadgeProps {
  status: string
  type?: StatusType
  className?: string
}

const statusTypeMap: Record<string, StatusType> = {
  // App statuses
  Deployed: "success",
  Draft: "info",
  Archived: "neutral",
  // Run statuses
  Success: "success",
  Failed: "error",
  Running: "info",
  Pending: "warning",
}

const typeStyles: Record<StatusType, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  neutral: "bg-muted text-muted-foreground border-border",
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const resolvedType = type || statusTypeMap[status] || "neutral"

  return (
    <Badge variant="outline" className={cn(typeStyles[resolvedType], className)}>
      {status}
    </Badge>
  )
}
