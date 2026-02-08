"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Bot,
  Rocket,
  Activity,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { IntelligentApp, RunRecord } from "@/lib/types"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingState } from "@/components/shared/loading-state"
import { appsApi, observabilityApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function DashboardOverview() {
  const router = useRouter()
  const { toast } = useToast()
  const [apps, setApps] = useState<IntelligentApp[]>([])
  const [runs, setRuns] = useState<RunRecord[]>([])
  const [metrics, setMetrics] = useState<{
    totalRuns: number
    avgLatency: number
    errorRate: number
    tokenUsage: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appsRes, runsRes, metricsRes] = await Promise.all([
          appsApi.list(),
          observabilityApi.getRuns(),
          observabilityApi.getMetrics(),
        ])

        if (appsRes.success && appsRes.data) setApps(appsRes.data)
        if (runsRes.success && runsRes.data) setRuns(runsRes.data)
        if (metricsRes.success && metricsRes.data) setMetrics(metricsRes.data)
      } catch {
        toast({
          title: "Error loading dashboard",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  if (loading) {
    return <LoadingState variant="dashboard" rows={5} />
  }

  const deployedApps = apps.filter((a) => a.status === "Deployed").length
  const draftApps = apps.filter((a) => a.status === "Draft").length
  const totalAgents = apps.reduce((sum, app) => sum + app.agentCount, 0)
  const recentRuns = runs.slice(0, 5)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your AI platform performance and health
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{apps.length}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-xs">
                {deployedApps} deployed
              </Badge>
              <Badge variant="outline" className="bg-chart-2/15 text-chart-2 border-chart-2/30 text-xs">
                {draftApps} draft
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Agents
            </CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {apps.length} applications
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Runs (30d)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics?.totalRuns.toLocaleString() || "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg latency: {metrics?.avgLatency || "-"}s
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Error Rate
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics?.errorRate || "-"}%
            </div>
            <p className="text-xs text-success mt-1">-0.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Recent Applications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => router.push("/")}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <CardDescription className="text-muted-foreground">
              Your most recently updated applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apps.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/apps/${app.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{app.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {app.agentCount} agents • v{app.version}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Runs */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => router.push("/observability")}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <CardDescription className="text-muted-foreground">
              Latest agent execution runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {run.status === "Success" && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                    {run.status === "Failed" && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    {run.status === "Running" && (
                      <Clock className="h-4 w-4 text-chart-2 animate-pulse" />
                    )}
                    <div>
                      <div className="font-medium text-foreground text-sm">{run.agentName}</div>
                      <div className="text-xs text-muted-foreground">{run.appName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(run.timestamp)}
                    </div>
                    {run.status !== "Running" && (
                      <div className="text-xs text-muted-foreground">{run.latency}ms</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto py-3 bg-transparent"
              onClick={() => router.push("/")}
            >
              <Plus className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Create Application</div>
                <div className="text-xs text-muted-foreground">Start a new AI app</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto py-3 bg-transparent"
              onClick={() => router.push("/agents")}
            >
              <Bot className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Browse Agents</div>
                <div className="text-xs text-muted-foreground">View agent library</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto py-3 bg-transparent"
              onClick={() => router.push("/orchestration")}
            >
              <Rocket className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Orchestration</div>
                <div className="text-xs text-muted-foreground">Build agent flows</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto py-3 bg-transparent"
              onClick={() => router.push("/observability")}
            >
              <Activity className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Observability</div>
                <div className="text-xs text-muted-foreground">Monitor performance</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
