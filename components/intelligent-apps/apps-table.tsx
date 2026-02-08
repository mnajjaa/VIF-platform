"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Rocket, Archive, Plus, LayoutDashboard } from "lucide-react"
import type { IntelligentApp } from "@/lib/types"
import { CreateAppDialog } from "./create-app-dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { appsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function AppsTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [apps, setApps] = useState<IntelligentApp[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadApps = async () => {
    setLoading(true)
    try {
      const response = await appsApi.list()
      if (response.success && response.data) {
        setApps(response.data)
      }
    } catch {
      toast({
        title: "Error loading applications",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApps()
  }, [])

  const handleDeploy = async (appId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoading(appId)
    try {
      const response = await appsApi.deploy(appId)
      if (response.success) {
        toast({
          title: "Deployment initiated",
          description: "Your application is being deployed.",
        })
        loadApps()
      }
    } catch {
      toast({
        title: "Deployment failed",
        description: "Failed to deploy application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleArchive = async (appId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoading(appId)
    try {
      const response = await appsApi.archive(appId)
      if (response.success) {
        toast({
          title: "Application archived",
          description: "The application has been archived successfully.",
        })
        loadApps()
      }
    } catch {
      toast({
        title: "Archive failed",
        description: "Failed to archive application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAppCreated = () => {
    toast({
      title: "Application created",
      description: "Your new application has been created successfully.",
    })
    loadApps()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <LoadingState variant="table" rows={5} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Intelligent Apps</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your AI-powered applications and agent orchestrations
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Intelligent App
        </Button>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            icon={LayoutDashboard}
            title="No applications yet"
            description="Create your first intelligent application to start orchestrating AI agents."
            action={{
              label: "Create Application",
              onClick: () => setCreateDialogOpen(true),
            }}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Version</TableHead>
                <TableHead className="text-muted-foreground">Agents</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Last Updated</TableHead>
                <TableHead className="text-muted-foreground w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow
                  key={app.id}
                  className="cursor-pointer border-border hover:bg-muted/50"
                  onClick={() => router.push(`/apps/${app.id}`)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{app.name}</div>
                      {app.description && <div className="text-sm text-muted-foreground">{app.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v{app.version}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{app.agentCount}</TableCell>
                  <TableCell><StatusBadge status={app.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(app.lastUpdated)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === app.id}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/apps/${app.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {app.status !== "Deployed" && (
                          <DropdownMenuItem onClick={(e) => handleDeploy(app.id, e)}>
                            <Rocket className="mr-2 h-4 w-4" />
                            Deploy
                          </DropdownMenuItem>
                        )}
                        {app.status !== "Archived" && (
                          <DropdownMenuItem className="text-destructive" onClick={(e) => handleArchive(app.id, e)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateAppDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleAppCreated} />
    </div>
  )
}
