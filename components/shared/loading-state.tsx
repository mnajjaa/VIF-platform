"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  variant?: "table" | "cards" | "form" | "dashboard"
  rows?: number
  className?: string
}

export function LoadingState({ variant = "table", rows = 5, className }: LoadingStateProps) {
  if (variant === "table") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-lg border border-border bg-card">
          <div className="p-4 space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 flex-1 max-w-[200px]" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-8 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === "cards") {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "form") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full max-w-[250px]" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === "dashboard") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
