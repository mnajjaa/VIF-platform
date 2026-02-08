"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsPage() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch {
      toast({
        title: "Save failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure platform-wide settings and preferences</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">API Configuration</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure API endpoints and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-foreground">Backend API URL</Label>
              <Input
                defaultValue="https://api.agentic-hub.example.com"
                className="bg-input border-border font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">MLflow Tracking URI</Label>
              <Input defaultValue="https://mlflow.example.com" className="bg-input border-border font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Model Providers</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure default model provider settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-foreground">Default Provider</Label>
              <Select defaultValue="openai">
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="azure">Azure OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Default Model</Label>
              <Select defaultValue="gpt-4-turbo">
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Audit & Compliance</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure audit logging and compliance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Enable Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Log all configuration changes and agent executions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">PII Detection</Label>
                <p className="text-sm text-muted-foreground">Automatically detect and mask PII in logs</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Retention Period</Label>
                <p className="text-sm text-muted-foreground">How long to retain audit logs</p>
              </div>
              <Select defaultValue="90d">
                <SelectTrigger className="w-[120px] bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                  <SelectItem value="7y">7 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Notifications</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure alert and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Error Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify on agent execution failures</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Schema Violations</Label>
                <p className="text-sm text-muted-foreground">Notify on schema validation failures</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Cost Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when cost exceeds threshold</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
