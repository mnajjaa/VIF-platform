import { MainLayout } from "@/components/layout/main-layout"
import { AgentConfigForm } from "@/components/agent-config/agent-config-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getAgentConfig } from "@/lib/placeholder-data"

interface AgentDetailPageProps {
  params: Promise<{ agentId: string }>
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { agentId } = await params
  const config = getAgentConfig(agentId)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">Back to Agents Library</span>
        </div>

        <AgentConfigForm config={config} />
      </div>
    </MainLayout>
  )
}
