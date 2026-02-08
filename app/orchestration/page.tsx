import { MainLayout } from "@/components/layout/main-layout"
import { OrchestrationTab } from "@/components/intelligent-apps/orchestration-tab"
import { getAgentsForApp } from "@/lib/placeholder-data"

export default function OrchestrationPage() {
  const agents = getAgentsForApp("app-1")

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Orchestration</h1>
          <p className="text-sm text-muted-foreground mt-1">Build and visualize agent orchestration workflows</p>
        </div>
        <OrchestrationTab agents={agents} />
      </div>
    </MainLayout>
  )
}
