"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { appsApi } from "@/lib/api"

interface CreateAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (appId: string) => void
}

export function CreateAppDialog({ open, onOpenChange, onSuccess }: CreateAppDialogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await appsApi.create({ name, description })
      if (response.success && response.data) {
        const appId = response.data.id
        onOpenChange(false)
        setName("")
        setDescription("")
        onSuccess?.(appId)
        // Navigate to onboarding flow
        router.push(`/apps/${appId}/onboarding`)
      } else {
        setError(response.error || "Failed to create application")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!loading) {
      onOpenChange(isOpen)
      if (!isOpen) {
        setName("")
        setDescription("")
        setError(null)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Intelligent App</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new intelligent application to orchestrate AI agents.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-foreground">
              Application Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter application name"
              className="bg-input border-border"
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this application"
              className="bg-input border-border resize-none"
              rows={3}
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={loading} className="bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
