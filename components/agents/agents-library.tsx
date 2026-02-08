"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Settings, Bot } from "lucide-react"
import type { Agent } from "@/lib/types"
import { agentsApi } from "@/lib/api"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { useToast } from "@/hooks/use-toast"

export function AgentsLibrary() {
  const router = useRouter()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await agentsApi.listAll()
        if (response.success && response.data) {
          setAgents(response.data)
        }
      } catch {
        toast({
          title: "Error loading agents",
          description: "Failed to load agents library. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadAgents()
  }, [toast])

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || agent.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeBadgeColor = (type: Agent["type"]) => {
    const colors: Record<Agent["type"], string> = {
      Extractor: "bg-chart-1/20 text-chart-1 border-chart-1/30",
      Mapper: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      Analysis: "bg-chart-3/20 text-chart-3 border-chart-3/30",
      Summarizer: "bg-chart-5/20 text-chart-5 border-chart-5/30",
    }
    return colors[type]
  }

  if (loading) {
    return <LoadingState variant="table" rows={5} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Agents Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and manage all AI agents across your applications</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] bg-input border-border">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Extractor">Extractor</SelectItem>
            <SelectItem value="Mapper">Mapper</SelectItem>
            <SelectItem value="Analysis">Analysis</SelectItem>
            <SelectItem value="Summarizer">Summarizer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Agent Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Config Version</TableHead>
              <TableHead className="text-muted-foreground">Tools Enabled</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No agents found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{agent.name}</div>
                      {agent.description && <div className="text-sm text-muted-foreground">{agent.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeBadgeColor(agent.type)}>
                      {agent.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      v{agent.configVersion}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {agent.toolsEnabled.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(`/agents/${agent.id}`)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
