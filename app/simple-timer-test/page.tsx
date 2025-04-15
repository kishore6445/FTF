"use client"
export const dynamic = "force-dynamic";

import { useEffect } from "react"
import SimplePomodoroTimer from "@/components/simple-pomodoro-timer"

export default function SimpleTimerTestPage() {
  useEffect(() => {
    console.log("Simple timer test page mounted")
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Pomodoro Timer Test</h1>
      <p className="mb-4">This is a simplified timer that doesn't use context.</p>
      <SimplePomodoroTimer taskTitle="Test Task" />
    </div>
  )
}

