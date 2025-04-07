"use client"

import type React from "react"

import { Suspense } from "react"
import DailyRituals from "./daily-rituals"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TasksProvider } from "@/contexts/tasks-context"

export default function DailyRitualsWrapper() {
  return (
    <TasksProvider>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        }
      >
        <ErrorBoundary>
          <DailyRituals />
        </ErrorBoundary>
      </Suspense>
    </TasksProvider>
  )
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

