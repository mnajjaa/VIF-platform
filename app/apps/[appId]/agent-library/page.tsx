"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Search,
  Plus,
  Bot,
  Loader2,
  ChevronRight,
  ChevronDown,
  GitBranch,
  Sparkles,
  CheckCircle2,
  Filter,
} from "lucide-react"
import type { Agent, AgentTypeCategory, AgentCategory } from "@/lib/types"
import { agentsApi } from "@/lib/api"
import { LoadingState } from "@/components/shared/loading-state"
import { useToast } from "@/hooks/use-toast"

// Define hierarchy structure
const TYPE_CATEGORIES: AgentTypeCategory[] = ["Core Intelligence", "Function", "Industry"]

const CATEGORY_BY_TYPE: Record<AgentTypeCategory, AgentCategory[]> = {
  "Core Intelligence": ["Knowledge & RAG", "Reasoning & Planning"],
  "Function": ["Data Processing", "Document Analysis", "Communication"],
  "Industry": ["Finance", "Banking", "Insurance"],
}

export default function AgentLibraryPage() {
  const params = useParams<{ appId: string }>()
  const appId = params.appId
  const router = useRouter()
  const { toast } = useToast()
  
  // Data state
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypeCategories, setSelectedTypeCategories] = useState<Set<AgentTypeCategory>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<AgentCategory>>(new Set())
  const [existingAgentFilter, setExistingAgentFilter] = useState<"all" | "yes" | "no">("all")
  
  // Tree expansion state
  const [expandedTypes, setExpandedTypes] = useState<Set<AgentTypeCategory>>(new Set(TYPE_CATEGORIES))
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await agentsApi.listLibrary()
        if (response.success && response.data) {
          setAgents(response.data)
        }
      } catch {
        toast({
          title: "Error loading agents",
          description: "Failed to load agent library. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadAgents()
  }, [toast])

  // Filter agents based on current filters
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Search filter
      if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Type category filter
      if (selectedTypeCategories.size > 0 && !selectedTypeCategories.has(agent.typeCategory)) {
        return false
      }
      
      // Category filter
      if (selectedCategories.size > 0 && !selectedCategories.has(agent.category)) {
        return false
      }
      
      // Existing agent filter
      if (existingAgentFilter === "yes" && !agent.isExistingAgent) {
        return false
      }
      if (existingAgentFilter === "no" && agent.isExistingAgent) {
        return false
      }
      
      return true
    })
  }, [agents, searchQuery, selectedTypeCategories, selectedCategories, existingAgentFilter])

  // Group agents by category for display
  const agentsByCategory = useMemo(() => {
    const grouped: Record<string, Agent[]> = {}
    for (const agent of filteredAgents) {
      const key = `${agent.typeCategory}|${agent.category}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(agent)
    }
    return grouped
  }, [filteredAgents])

  // Count agents per category for tree display
  const agentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const agent of agents) {
      const typeKey = agent.typeCategory
      const catKey = `${agent.typeCategory}|${agent.category}`
      counts[typeKey] = (counts[typeKey] || 0) + 1
      counts[catKey] = (counts[catKey] || 0) + 1
    }
    return counts
  }, [agents])

  const toggleTypeExpanded = (type: AgentTypeCategory) => {
    const newExpanded = new Set(expandedTypes)
    if (newExpanded.has(type)) {
      newExpanded.delete(type)
    } else {
      newExpanded.add(type)
    }
    setExpandedTypes(newExpanded)
  }

  const toggleCategoryExpanded = (key: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleTypeFilter = (type: AgentTypeCategory) => {
    const newSelected = new Set(selectedTypeCategories)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypeCategories(newSelected)
  }

  const toggleCategoryFilter = (category: AgentCategory) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(category)) {
      newSelected.delete(category)
    } else {
      newSelected.add(category)
    }
    setSelectedCategories(newSelected)
  }

  const handleAddAgent = async (agentId: string) => {
    setAdding(agentId)
    try {
      const response = await agentsApi.addToApp(appId, agentId)
      if (response.success) {
        const agent = agents.find(a => a.id === agentId)
        toast({
          title: "Agent added",
          description: `${agent?.name || "Agent"} has been added to your application.`,
        })
      }
    } catch {
      toast({
        title: "Error adding agent",
        description: "Failed to add agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAdding(null)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTypeCategories(new Set())
    setSelectedCategories(new Set())
    setExistingAgentFilter("all")
  }

  const hasActiveFilters = searchQuery || selectedTypeCategories.size > 0 || selectedCategories.size > 0 || existingAgentFilter !== "all"

  const getTypeBadgeColor = (type: Agent["type"]) => {
    const colors: Record<Agent["type"], string> = {
      Extractor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      Mapper: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      Analysis: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      Summarizer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    }
    return colors[type] || ""
  }

  if (loading) {
    return (
      <MainLayout>
        <LoadingState variant="cards" rows={6} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/apps/${appId}/onboarding`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Agent Library</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and select agents to compose your application
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/apps/${appId}?tab=orchestration`)}
            className="gap-2"
          >
            <GitBranch className="h-4 w-4" />
            Go to Orchestration
          </Button>
        </div>

        {/* Two-panel layout */}
        <div className="flex gap-6">
          {/* Left Panel - Filters & Tree Navigation */}
          <div className="w-72 shrink-0">
            <Card className="bg-card border-border sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                      Clear all
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-input border-border h-9"
                  />
                </div>

                {/* Existing Agent Filter */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Existing Agent
                  </Label>
                  <div className="flex gap-1">
                    {(["all", "yes", "no"] as const).map((value) => (
                      <Button
                        key={value}
                        variant={existingAgentFilter === value ? "default" : "outline"}
                        size="sm"
                        className={`h-7 text-xs flex-1 ${existingAgentFilter !== value ? "bg-transparent" : ""}`}
                        onClick={() => setExistingAgentFilter(value)}
                      >
                        {value === "all" ? "All" : value === "yes" ? "Yes" : "No"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tree Navigation */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Browse by Type
                  </Label>
                  <ScrollArea className="h-[320px] pr-3">
                    <div className="space-y-1">
                      {TYPE_CATEGORIES.map((typeCategory) => {
                        const isTypeExpanded = expandedTypes.has(typeCategory)
                        const isTypeSelected = selectedTypeCategories.has(typeCategory)
                        const typeCount = agentCounts[typeCategory] || 0
                        
                        return (
                          <Collapsible key={typeCategory} open={isTypeExpanded}>
                            <div className="flex items-center gap-1">
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => toggleTypeExpanded(typeCategory)}
                                >
                                  {isTypeExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <button
                                type="button"
                                className={`flex-1 flex items-center justify-between px-2 py-1 rounded text-sm text-left transition-colors ${
                                  isTypeSelected
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted text-foreground"
                                }`}
                                onClick={() => toggleTypeFilter(typeCategory)}
                              >
                                <span className="font-medium">{typeCategory}</span>
                                <span className="text-xs text-muted-foreground">{typeCount}</span>
                              </button>
                            </div>
                            <CollapsibleContent>
                              <div className="ml-6 mt-1 space-y-0.5">
                                {CATEGORY_BY_TYPE[typeCategory].map((category) => {
                                  const catKey = `${typeCategory}|${category}`
                                  const catCount = agentCounts[catKey] || 0
                                  const isCatSelected = selectedCategories.has(category)
                                  
                                  return (
                                    <button
                                      key={category}
                                      type="button"
                                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-sm text-left transition-colors ${
                                        isCatSelected
                                          ? "bg-primary/10 text-primary"
                                          : "hover:bg-muted text-muted-foreground"
                                      }`}
                                      onClick={() => toggleCategoryFilter(category)}
                                    >
                                      <span>{category}</span>
                                      <span className="text-xs">{catCount}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Panel - Agent Cards */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAgents.length} of {agents.length} agents
              </p>
            </div>

            {filteredAgents.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No agents found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters or search query.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        className="mt-4 bg-transparent"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredAgents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="bg-card border-border hover:border-muted-foreground/50 transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                            <Bot className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base text-foreground truncate">
                              {agent.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{agent.category}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className="text-muted-foreground text-sm line-clamp-2">
                        {agent.description || `A ${agent.type.toLowerCase()} agent.`}
                      </CardDescription>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className={getTypeBadgeColor(agent.type)}>
                          {agent.type}
                        </Badge>
                        {agent.isExistingAgent && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Existing
                          </Badge>
                        )}
                        {agent.hasAIBuilder && (
                          <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/30">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Builder
                          </Badge>
                        )}
                      </div>
                      
                      {/* Meta info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>v{agent.configVersion}</span>
                        <span>·</span>
                        <span>{agent.toolsEnabled.length} tools</span>
                      </div>
                      
                      {/* Add button */}
                      <Button
                        className="w-full gap-2"
                        size="sm"
                        onClick={() => handleAddAgent(agent.id)}
                        disabled={adding === agent.id}
                      >
                        {adding === agent.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Add to Application
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
