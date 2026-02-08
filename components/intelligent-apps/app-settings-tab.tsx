"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import type { IntelligentApp } from "@/lib/types"

interface AppSettingsTabProps {
  app: IntelligentApp
}

export function AppSettingsTab({ app }: AppSettingsTabProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">General Settings</CardTitle>
          <CardDescription className="text-muted-foreground">Configure basic application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="app-name" className="text-foreground">
              Application Name
            </Label>
            <Input id="app-name" defaultValue={app.name} className="bg-input border-border" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="app-version" className="text-foreground">
              Version
            </Label>
            <Input id="app-version" defaultValue={app.version} className="bg-input border-border" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Deployment Settings</CardTitle>
          <CardDescription className="text-muted-foreground">Configure deployment and runtime options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Auto-deploy on config change</Label>
              <p className="text-sm text-muted-foreground">
                Automatically deploy when agent configurations are updated
              </p>
            </div>
            <Switch />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Enable audit logging</Label>
              <p className="text-sm text-muted-foreground">Log all configuration changes for compliance</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Rate limiting</Label>
              <p className="text-sm text-muted-foreground">Apply rate limits to agent executions</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-muted-foreground">Irreversible actions for this application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Archive Application</Label>
              <p className="text-sm text-muted-foreground">Archive this application and stop all executions</p>
            </div>
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
