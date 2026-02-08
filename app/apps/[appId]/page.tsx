import { MainLayout } from "@/components/layout/main-layout"
import { AppDetailTabs } from "@/components/intelligent-apps/app-detail-tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Rocket } from "lucide-react"
import Link from "next/link"
import { getIntelligentApps, getAgentsForApp } from "@/lib/placeholder-data"

interface AppDetailPageProps {
  params: Promise<{ appId: string }>
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { appId } = await params
  const apps = getIntelligentApps()
  const app = apps.find((a) => a.id === appId) || apps[0]
  const agents = getAgentsForApp(appId)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/apps">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">{app.name}</h1>
                <Badge
                  variant={app.status === "Deployed" ? "default" : "secondary"}
                  className={app.status === "Deployed" ? "bg-success" : ""}
                >
                  {app.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
            </div>
          </div>
          <Button className="gap-2">
            <Rocket className="h-4 w-4" />
            Deploy
          </Button>
        </div>

        <AppDetailTabs app={app} agents={agents} />
      </div>
    </MainLayout>
  )
}
