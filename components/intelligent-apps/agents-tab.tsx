"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings } from "lucide-react"
import type { Agent } from "@/lib/types"
import { AddAgentDialog } from "./add-agent-dialog"

interface AgentsTabProps {
  agents: Agent[]
  appId: string
}

export function AgentsTab({ agents, appId }: AgentsTabProps) {
  const router = useRouter()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const getTypeBadgeColor = (type: Agent["type"]) => {
    const colors: Record<Agent["type"], string> = {
      Extractor: "bg-chart-1/20 text-chart-1 border-chart-1/30",
      Mapper: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      Analysis: "bg-chart-3/20 text-chart-3 border-chart-3/30",
      Summarizer: "bg-chart-5/20 text-chart-5 border-chart-5/30",
    }
    return colors[type]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Agents</h3>
          <p className="text-sm text-muted-foreground">Configure the AI agents that compose this application</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
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
            {agents.map((agent) => (
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
                    onClick={() => router.push(`/apps/${appId}/agents/${agent.id}`)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddAgentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}
