"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Coffee, Timer, StopCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimplePomodoroTimerProps {
  taskId?: string
  taskTitle?: string
  onTimeSpent?: (seconds: number) => void
  onComplete?: () => void
  className?: string
}

type TimerMode = "work" | "shortBreak" | "longBreak"

export default function SimplePomodoroTimer({
  taskId,
  taskTitle,
  onTimeSpent,
  onComplete,
  className,
}: SimplePomodoroTimerProps) {
  // Timer durations
  const WORK_DURATION = 25 * 60 // 25 minutes in seconds
  const SHORT_BREAK_DURATION = 5 * 60 // 5 minutes
  const LONG_BREAK_DURATION = 15 * 60 // 15 minutes

  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [timerMode, setTimerMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [sessionTimeSpent, setSessionTimeSpent] = useState(0)

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start the timer
  const startTimer = () => {
    console.log("Starting timer")
    setIsRunning(true)
  }

  // Pause the timer
  const pauseTimer = () => {
    console.log("Pausing timer")
    setIsRunning(false)
  }

  // Reset the timer
  const resetTimer = () => {
    console.log("Resetting timer")
    setIsRunning(false)

    // Reset time based on current mode
    if (timerMode === "work") {
      setTimeLeft(WORK_DURATION)
    } else if (timerMode === "shortBreak") {
      setTimeLeft(SHORT_BREAK_DURATION)
    } else {
      setTimeLeft(LONG_BREAK_DURATION)
    }

    setSessionTimeSpent(0)
  }

  // Skip to next phase
  const skipPhase = (targetMode?: TimerMode) => {
    console.log("Skipping to", targetMode || (timerMode === "work" ? "break" : "work"))
    setIsRunning(false)

    const newMode = targetMode || (timerMode === "work" ? "shortBreak" : "work")
    setTimerMode(newMode)

    // Set time based on new mode
    if (newMode === "work") {
      setTimeLeft(WORK_DURATION)
    } else if (newMode === "shortBreak") {
      setTimeLeft(SHORT_BREAK_DURATION)
    } else {
      setTimeLeft(LONG_BREAK_DURATION)
    }

    setSessionTimeSpent(0)
  }

  // Stop and save
  const stopAndSave = () => {
    console.log("Stopping and saving")
    setIsRunning(false)

    if (onTimeSpent && sessionTimeSpent > 0) {
      onTimeSpent(sessionTimeSpent)
    }

    if (onComplete) {
      onComplete()
    }
  }

  // Timer effect
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Start a new timer if running
    if (isRunning) {
      console.log("Setting up interval")
      timerRef.current = setInterval(() => {
        console.log("Timer tick")

        setTimeLeft((prevTime) => {
          // If time is up
          if (prevTime <= 1) {
            // Clear the interval
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }

            // Handle session completion
            if (timerMode === "work") {
              setCompletedSessions((prev) => prev + 1)
              skipPhase("shortBreak")
            } else {
              skipPhase("work")
            }

            setIsRunning(false)
            return 0
          }

          // Otherwise, decrement time
          return prevTime - 1
        })

        // Update session time spent for work sessions
        if (timerMode === "work") {
          setSessionTimeSpent((prev) => prev + 1)
        }
      }, 1000)
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, timerMode])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalDuration =
      timerMode === "work" ? WORK_DURATION : timerMode === "shortBreak" ? SHORT_BREAK_DURATION : LONG_BREAK_DURATION
    return (timeLeft / totalDuration) * 100
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          "h-2 transition-colors",
          timerMode === "work" ? "bg-red-500" : timerMode === "shortBreak" ? "bg-blue-400" : "bg-blue-600",
        )}
        style={{ width: `${calculateProgress()}%` }}
      />
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {taskTitle && <h3 className="font-medium text-center mb-2">{taskTitle}</h3>}

          <div className="flex items-center justify-center mb-4">
            <div className={cn("text-4xl font-mono", timerMode !== "work" ? "text-blue-500" : "text-red-500")}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Button
              variant={timerMode !== "work" ? "outline" : "default"}
              size="sm"
              className={timerMode === "work" ? "bg-red-500 hover:bg-red-600" : ""}
              onClick={() => skipPhase("work")}
            >
              <Timer className="h-4 w-4 mr-1" />
              Focus
            </Button>
            <Button
              variant={timerMode !== "work" ? "default" : "outline"}
              size="sm"
              className={timerMode !== "work" ? "bg-blue-500 hover:bg-blue-600" : ""}
              onClick={() => timerMode === "work" && skipPhase("shortBreak")}
            >
              <Coffee className="h-4 w-4 mr-1" />
              Break
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={isRunning ? "outline" : "default"}
              size="sm"
              onClick={isRunning ? pauseTimer : startTimer}
              className="min-w-[80px]"
            >
              {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetTimer}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => skipPhase()}>
              Skip
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={stopAndSave}
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Stop & Save
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {timerMode === "work" ? "Focus Time" : timerMode === "shortBreak" ? "Short Break" : "Long Break"} •{" "}
            {completedSessions} sessions completed
          </div>

          {timerMode === "work" && sessionTimeSpent > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Current session: {Math.floor(sessionTimeSpent / 60)}m {sessionTimeSpent % 60}s
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

