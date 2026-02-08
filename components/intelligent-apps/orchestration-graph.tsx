"use client"

import { useMemo } from "react"
import type { Agent } from "@/lib/types"
import { Bot } from "lucide-react"

interface OrchestrationGraphProps {
  agents: Agent[]
  selectedNode: string | null
  onSelectNode: (nodeId: string | null) => void
}

export function OrchestrationGraph({ agents, selectedNode, onSelectNode }: OrchestrationGraphProps) {
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    const centerY = 250
    const startX = 100
    const spacing = 200

    agents.forEach((agent, index) => {
      positions[agent.id] = {
        x: startX + index * spacing,
        y: centerY + (index % 2 === 0 ? -30 : 30),
      }
    })

    return positions
  }, [agents])

  const getTypeColor = (type: Agent["type"]) => {
    const colors: Record<Agent["type"], string> = {
      Extractor: "#4ade80",
      Mapper: "#60a5fa",
      Analysis: "#f59e0b",
      Summarizer: "#a78bfa",
    }
    return colors[type]
  }

  return (
    <div className="relative w-full h-full overflow-auto bg-muted/30 rounded-lg">
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {agents.slice(0, -1).map((agent, index) => {
          const from = nodePositions[agent.id]
          const to = nodePositions[agents[index + 1].id]
          if (!from || !to) return null

          return (
            <g key={`edge-${agent.id}`}>
              <line
                x1={from.x + 70}
                y1={from.y + 35}
                x2={to.x}
                y2={to.y + 35}
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary/50"
                markerEnd="url(#arrowhead)"
              />
            </g>
          )
        })}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-primary/50" />
          </marker>
        </defs>
      </svg>

      {/* Nodes */}
      {agents.map((agent) => {
        const pos = nodePositions[agent.id]
        if (!pos) return null

        const isSelected = selectedNode === agent.id

        return (
          <div
            key={agent.id}
            className={`absolute cursor-pointer transition-all duration-200 ${
              isSelected ? "scale-105" : "hover:scale-102"
            }`}
            style={{ left: pos.x, top: pos.y }}
            onClick={() => onSelectNode(isSelected ? null : agent.id)}
          >
            <div
              className={`w-36 rounded-lg border-2 bg-card p-3 shadow-lg ${
                isSelected ? "border-primary" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="h-6 w-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: getTypeColor(agent.type) + "30" }}
                >
                  <Bot className="h-3.5 w-3.5" style={{ color: getTypeColor(agent.type) }} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{agent.type}</span>
              </div>
              <div className="text-sm font-medium text-foreground truncate">{agent.name}</div>
            </div>
          </div>
        )
      })}

      {/* Empty state */}
      {agents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No agents added yet</p>
            <p className="text-sm">Add agents to build your orchestration</p>
          </div>
        </div>
      )}
    </div>
  )
}
