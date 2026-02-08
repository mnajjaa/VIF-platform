"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, History } from "lucide-react"
import type { PromptArtifact } from "@/lib/types"

interface PromptsTableProps {
  artifacts: PromptArtifact[]
}

export function PromptsTable({ artifacts }: PromptsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedArtifact, setSelectedArtifact] = useState<PromptArtifact | null>(null)
  const [versionDialogOpen, setVersionDialogOpen] = useState(false)
  const [selectedForVersion, setSelectedForVersion] = useState<PromptArtifact | null>(null)

  const filteredArtifacts = artifacts.filter((artifact) => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || artifact.type === typeFilter
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeBadge = (type: PromptArtifact["type"]) => {
    const colors: Record<PromptArtifact["type"], string> = {
      system: "bg-chart-1/20 text-chart-1 border-chart-1/30",
      task: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      schema: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    }
    return (
      <Badge variant="outline" className={colors[type]}>
        {type}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Prompts & Artifacts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage MLflow-stored prompt artifacts and schemas</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search artifacts..."
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
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="schema">Schema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Version</TableHead>
              <TableHead className="text-muted-foreground">Last Updated</TableHead>
              <TableHead className="text-muted-foreground w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArtifacts.map((artifact) => (
              <TableRow key={artifact.id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">{artifact.name}</TableCell>
                <TableCell>{getTypeBadge(artifact.type)}</TableCell>
                <TableCell>
                  <code className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    v{artifact.version}
                  </code>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(artifact.lastUpdated)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedArtifact(artifact)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedForVersion(artifact)
                        setVersionDialogOpen(true)
                      }}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Content Dialog */}
      <Dialog open={!!selectedArtifact} onOpenChange={() => setSelectedArtifact(null)}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedArtifact?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Version {selectedArtifact?.version} • {selectedArtifact?.type} prompt
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Badge variant="outline" className="mb-4">
              Read Only
            </Badge>
            <pre className="p-4 rounded-lg bg-muted text-sm text-muted-foreground overflow-auto font-mono max-h-[400px]">
              {selectedArtifact?.content || "Content not available"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Switch Dialog */}
      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Switch Version</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a version for {selectedForVersion?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Select defaultValue={selectedForVersion?.version}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.2.0">v1.2.0 (current)</SelectItem>
                <SelectItem value="1.1.0">v1.1.0</SelectItem>
                <SelectItem value="1.0.0">v1.0.0</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This is a config-only change and will not modify the artifact content.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVersionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setVersionDialogOpen(false)}>Switch Version</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
