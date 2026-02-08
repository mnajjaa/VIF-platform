import { MainLayout } from "@/components/layout/main-layout"
import { PromptsTable } from "@/components/prompts/prompts-table"
import { getPromptArtifacts } from "@/lib/placeholder-data"

export default function PromptsPage() {
  const artifacts = getPromptArtifacts()

  return (
    <MainLayout>
      <PromptsTable artifacts={artifacts} />
    </MainLayout>
  )
}
