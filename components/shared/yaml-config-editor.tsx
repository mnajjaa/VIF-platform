"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Edit2, Eye, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface YAMLConfigEditorProps {
  title?: string
  description?: string
  content: string
  readOnly?: boolean
  onChange?: (content: string) => void
  className?: string
}

export function YAMLConfigEditor({
  title,
  description,
  content,
  readOnly = true,
  onChange,
  className,
}: YAMLConfigEditorProps) {
  const [copied, setCopied] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [localContent, setLocalContent] = useState(content)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([localContent], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "config.yaml"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    onChange?.(localContent)
    setEditMode(false)
  }

  return (
    <Card className={cn("bg-card border-border", className)}>
      {(title || description) && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="text-foreground text-sm">{title}</CardTitle>}
              {description && (
                <CardDescription className="text-muted-foreground text-xs mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {readOnly && (
                <Badge variant="outline" className="text-xs">
                  Read Only
                </Badge>
              )}
              {!readOnly && !editMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5"
                  onClick={() => setEditMode(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              {!readOnly && editMode && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      setLocalContent(content)
                      setEditMode(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="h-7" onClick={handleSave}>
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={!title && !description ? "pt-4" : ""}>
        <div className="relative">
          {editMode ? (
            <Textarea
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              className="font-mono text-sm bg-muted border-border min-h-[300px] resize-y"
            />
          ) : (
            <pre className="p-4 rounded-lg bg-muted text-sm text-muted-foreground overflow-auto font-mono max-h-[400px]">
              {localContent}
            </pre>
          )}
          {!editMode && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-card/80 hover:bg-card"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-card/80 hover:bg-card"
                onClick={handleDownload}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
