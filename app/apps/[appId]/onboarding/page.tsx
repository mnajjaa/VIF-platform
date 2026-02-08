"use client"

import { useRouter, useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Library, PlusCircle, ArrowRight, Sparkles } from "lucide-react"

export default function OnboardingPage() {
  const params = useParams<{ appId: string }>()
  const appId = params.appId
  const router = useRouter()

  const options = [
    {
      id: "library",
      icon: Library,
      title: "Build from Agent Library",
      description:
        "Start from pre-built agents available in the Agentic Hub library and compose them into an intelligent application.",
      ctaLabel: "Browse Agent Library",
      href: `/apps/${appId}/agent-library`,
    },
    {
      id: "create",
      icon: PlusCircle,
      title: "Create New Agents",
      description:
        "Create new AI agents from scratch by defining configuration, prompts, schemas, and tools.",
      ctaLabel: "Create New Agent",
      href: `/apps/${appId}/agents/new`,
    },
  ]

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="max-w-3xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              How do you want to build your Intelligent App?
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Choose how you want to get started. You can always add more agents or
              create new ones later.
            </p>
          </div>

          {/* Option Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {options.map((option) => (
              <Card
                key={option.id}
                className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => router.push(option.href)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <option.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-lg text-foreground">{option.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    {option.description}
                  </CardDescription>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-transparent group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                  >
                    {option.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skip option */}
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.push(`/apps/${appId}`)}
            >
              Skip for now and go to app dashboard
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
