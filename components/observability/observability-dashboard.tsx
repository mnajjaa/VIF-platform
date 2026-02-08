"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Zap, AlertTriangle, Coins, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { observabilityApi } from "@/lib/api"
import { LoadingState } from "@/components/shared/loading-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { useToast } from "@/hooks/use-toast"
import type { RunRecord, SchemaViolation } from "@/lib/types"

export function ObservabilityDashboard() {
  const { toast } = useToast()
  const [runs, setRuns] = useState<RunRecord[]>([])
  const [violations, setViolations] = useState<SchemaViolation[]>([])
  const [metrics, setMetrics] = useState<{
    totalRuns: number
    avgLatency: number
    errorRate: number
    tokenUsage: number
    estimatedCost: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async (showRefreshToast = false) => {
    try {
      const [runsRes, violationsRes, metricsRes] = await Promise.all([
        observabilityApi.getRuns(),
        observabilityApi.getViolations(),
        observabilityApi.getMetrics(),
      ])

      if (runsRes.success && runsRes.data) setRuns(runsRes.data)
      if (violationsRes.success && violationsRes.data) setViolations(violationsRes.data)
      if (metricsRes.success && metricsRes.data) setMetrics(metricsRes.data)

      if (showRefreshToast) {
        toast({
          title: "Data refreshed",
          description: "Observability data has been updated.",
        })
      }
    } catch {
      toast({
        title: "Error loading data",
        description: "Failed to load observability data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData(true)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Success: "default",
      Failed: "destructive",
      Running: "secondary",
    }
    return (
      <Badge variant={variants[status] || "outline"} className={status === "Success" ? "bg-success" : ""}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return <LoadingState variant="dashboard" rows={5} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Observability</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor agent performance, runs, and schema compliance</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2 bg-transparent">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics?.totalRuns.toLocaleString() || "-"}
            </div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics?.avgLatency || "-"}s</div>
            <p className="text-xs text-muted-foreground">-8% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics?.errorRate || "-"}%</div>
            <p className="text-xs text-muted-foreground">-0.3% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Token Usage</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics ? `${(metrics.tokenUsage / 1000000).toFixed(1)}M` : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Est. cost: ${metrics?.estimatedCost || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="runs" className="w-full">
        <TabsList className="bg-muted border-border">
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="traces">Traces</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="violations">Schema Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-muted-foreground">Timestamp</TableHead>
                    <TableHead className="text-muted-foreground">Agent</TableHead>
                    <TableHead className="text-muted-foreground">Application</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Latency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow key={run.id} className="border-border hover:bg-muted/50 cursor-pointer">
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {formatTimestamp(run.timestamp)}
                      </TableCell>
                      <TableCell className="text-foreground">{run.agentName}</TableCell>
                      <TableCell className="text-muted-foreground">{run.appName}</TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {run.status === "Running" ? "—" : `${run.latency}ms`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traces" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Execution Traces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {runs.slice(0, 3).map((run) => (
                  <div key={run.id} className="p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{run.agentName}</span>
                        {getStatusBadge(run.status)}
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{formatTimestamp(run.timestamp)}</span>
                    </div>
                    <div className="grid gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Input:</span>
                        <pre className="mt-1 p-2 rounded bg-muted text-muted-foreground font-mono text-xs overflow-auto">
                          {'{ "document_id": "doc-12345", "extract_fields": ["amount", "date", "counterparty"] }'}
                        </pre>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Output:</span>
                        <pre className="mt-1 p-2 rounded bg-muted text-muted-foreground font-mono text-xs overflow-auto">
                          {'{ "amount": 150000.00, "date": "2024-01-15", "counterparty": "Acme Corp" }'}
                        </pre>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tool Calls:</span>
                        <div className="mt-1 flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            pdf-parser
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            schema-validator
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Token Usage by Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Data Extractor", tokens: 890000, cost: 178 },
                    { name: "Risk Analyzer", tokens: 720000, cost: 144 },
                    { name: "Field Mapper", tokens: 450000, cost: 90 },
                    { name: "Report Generator", tokens: 340000, cost: 68 },
                  ].map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between">
                      <span className="text-foreground">{agent.name}</span>
                      <div className="text-right">
                        <span className="text-muted-foreground">{(agent.tokens / 1000).toFixed(0)}K tokens</span>
                        <span className="text-muted-foreground ml-3">${agent.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Error Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Schema Validation", count: 45, percent: 38 },
                    { type: "Timeout", count: 32, percent: 27 },
                    { type: "Rate Limit", count: 28, percent: 24 },
                    { type: "Other", count: 13, percent: 11 },
                  ].map((error) => (
                    <div key={error.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground">{error.type}</span>
                        <span className="text-muted-foreground">
                          {error.count} ({error.percent}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-destructive/60 rounded-full" style={{ width: `${error.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="violations" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Schema Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-muted-foreground">Timestamp</TableHead>
                    <TableHead className="text-muted-foreground">Agent</TableHead>
                    <TableHead className="text-muted-foreground">Expected</TableHead>
                    <TableHead className="text-muted-foreground">Actual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id} className="border-border hover:bg-muted/50">
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {formatTimestamp(violation.timestamp)}
                      </TableCell>
                      <TableCell className="text-foreground">{violation.agentName}</TableCell>
                      <TableCell>
                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {violation.expected}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                          {violation.actual}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
