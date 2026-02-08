"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentsTab } from "./agents-tab"
import { OrchestrationTab } from "./orchestration-tab"
import { AppOverviewTab } from "./app-overview-tab"
import { AppObservabilityTab } from "./app-observability-tab"
import { AppSettingsTab } from "./app-settings-tab"
import type { IntelligentApp, Agent } from "@/lib/types"

interface AppDetailTabsProps {
  app: IntelligentApp
  agents: Agent[]
}

export function AppDetailTabs({ app, agents }: AppDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="bg-muted border-border">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="agents">Agents</TabsTrigger>
        <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
        <TabsTrigger value="observability">Observability</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6">
        <AppOverviewTab app={app} agents={agents} />
      </TabsContent>
      <TabsContent value="agents" className="mt-6">
        <AgentsTab agents={agents} appId={app.id} />
      </TabsContent>
      <TabsContent value="orchestration" className="mt-6">
        <OrchestrationTab agents={agents} appId={app.id} />
      </TabsContent>
      <TabsContent value="observability" className="mt-6">
        <AppObservabilityTab appId={app.id} />
      </TabsContent>
      <TabsContent value="settings" className="mt-6">
        <AppSettingsTab app={app} />
      </TabsContent>
    </Tabs>
  )
}
