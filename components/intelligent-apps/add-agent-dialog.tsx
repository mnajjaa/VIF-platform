"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getConfigTemplates } from "@/lib/placeholder-data"
import type { AgentType } from "@/lib/types"

interface AddAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const agentTypes: AgentType[] = ["Extractor", "Mapper", "Analysis", "Summarizer"]

export function AddAgentDialog({ open, onOpenChange }: AddAgentDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<AgentType | "">("")
  const [template, setTemplate] = useState("")
  const [attachToGraph, setAttachToGraph] = useState(true)

  const templates = getConfigTemplates()
  const filteredTemplates = type ? templates.filter((t) => t.type === type) : templates

  const handleAdd = () => {
    // API call would go here
    console.log("[v0] Adding agent:", { name, type, template, attachToGraph })
    onOpenChange(false)
    setName("")
    setType("")
    setTemplate("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Agent</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new AI agent to this intelligent application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="agent-name" className="text-foreground">
              Agent Name
            </Label>
            <Input
              id="agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
              className="bg-input border-border"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="agent-type" className="text-foreground">
              Agent Type
            </Label>
            <Select value={type} onValueChange={(value) => setType(value as AgentType)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent>
                {agentTypes.map((agentType) => (
                  <SelectItem key={agentType} value={agentType}>
                    {agentType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="config-template" className="text-foreground">
              Base Config Template (YAML)
            </Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select config template" />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="attach-graph" className="text-foreground">
              Attach to orchestration graph
            </Label>
            <Switch id="attach-graph" checked={attachToGraph} onCheckedChange={setAttachToGraph} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name || !type}>
            Add Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
