"use client"
export const dynamic = "force-dynamic";

import { useEffect } from "react"
import PomodoroTimer from "@/components/pomodoro-timer"
import { PomodoroProvider } from "@/contexts/pomodoro-context"

export default function TimerTestPage() {
  useEffect(() => {
    console.log("Timer test page mounted")
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pomodoro Timer Test</h1>
      <PomodoroProvider>
        <PomodoroTimer taskTitle="Test Task" />
      </PomodoroProvider>
    </div>
  )
}

