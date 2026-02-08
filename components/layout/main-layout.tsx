"use client"

import type React from "react"

import { Sidebar } from "./sidebar"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 transition-all duration-300">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
