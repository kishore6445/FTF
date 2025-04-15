"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import PomodoroTimer from "@/components/pomodoro-timer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PomodoroTimerPage() {
  const [taskTitle, setTaskTitle] = useState<string>("Focus Session")

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label htmlFor="task-title" className="block text-sm font-medium mb-1">
              Session Name
            </label>
            <input
              id="task-title"
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="What are you working on?"
            />
          </div>

          <PomodoroTimer
            taskTitle={taskTitle}
            onTimeSpent={(seconds) => {
              console.log(`Time spent: ${seconds} seconds on "${taskTitle}"`)
            }}
          />

          <div className="mt-6 text-sm text-muted-foreground">
            <h3 className="font-medium mb-2">How to use the Pomodoro Technique:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Choose a task to work on</li>
              <li>Set the timer for 25 minutes and focus completely on the task</li>
              <li>When the timer rings, take a 5-minute break</li>
              <li>After 4 pomodoros, take a longer 15-30 minute break</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

