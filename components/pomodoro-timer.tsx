"use client"
export const dynamic = "force-dynamic";

import { useEffect, useState, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Coffee, Timer, StopCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { PomodoroContext } from "@/contexts/pomodoro-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

interface PomodoroTimerProps {
  taskId?: string
  taskTitle?: string
  onTimeSpent?: (seconds: number) => void
  onComplete?: () => void
  className?: string
  compact?: boolean
}

export default function PomodoroTimer({
  taskId,
  taskTitle,
  onTimeSpent,
  onComplete,
  className,
  compact = false,
}: PomodoroTimerProps) {
  // Create a fallback state for when the context is not available
  const [fallbackTimeLeft, setFallbackTimeLeft] = useState<number>(25 * 60)
  const [fallbackIsRunning, setFallbackIsRunning] = useState<boolean>(false)
  const [fallbackSessionTimeSpent, setFallbackSessionTimeSpent] = useState<number>(0)
  const [fallbackTimerMode, setFallbackTimerMode] = useState<"work" | "shortBreak" | "longBreak">("work")
  const [lastTickTime, setLastTickTime] = useState<number | null>(null)
  const { toast } = useToast()

  // Try to use the context, but don't throw an error if it's not available
  const pomodoroContext = useContext(PomodoroContext)

  // Log the context to debug
  useEffect(() => {
    console.log("PomodoroTimer: Context available:", !!pomodoroContext)
  }, [pomodoroContext])

  const {
    isRunning = fallbackIsRunning,
    timerMode = fallbackTimerMode,
    timeLeft = fallbackTimeLeft,
    completedSessions = 0,
    currentSessionTimeSpent = fallbackSessionTimeSpent,
    totalTimeSpent = 0,
    startTimer = () => {
      console.log("Fallback startTimer called")
      setFallbackIsRunning(true)
      setLastTickTime(Date.now())
    },
    pauseTimer = () => {
      console.log("Fallback pauseTimer called")
      setFallbackIsRunning(false)
      setLastTickTime(null)
    },
    resetTimer = () => {
      console.log("Fallback resetTimer called")
      setFallbackTimeLeft(25 * 60)
      setFallbackSessionTimeSpent(0)
    },
    skipPhase = (phase?: "work" | "shortBreak" | "longBreak") => {
      console.log("Fallback skipPhase called", phase)
      if (phase) {
        setFallbackTimerMode(phase)
        if (phase === "work") {
          setFallbackTimeLeft(25 * 60)
        } else if (phase === "shortBreak") {
          setFallbackTimeLeft(5 * 60)
        } else {
          setFallbackTimeLeft(15 * 60)
        }
      } else {
        // Toggle between work and break
        if (fallbackTimerMode === "work") {
          setFallbackTimerMode("shortBreak")
          setFallbackTimeLeft(5 * 60)
        } else {
          setFallbackTimerMode("work")
          setFallbackTimeLeft(25 * 60)
        }
      }
    },
    stopAndSave = async () => {
      console.log("Fallback stopAndSave called")

      // If we have a taskId and time spent, save it directly
      if (taskId && fallbackSessionTimeSpent > 0) {
        try {
          // Get user ID from auth
          const {
            data: { user },
          } = await supabase.auth.getUser()

          const { error } = await supabase.from("pomodoro_sessions").insert({
            id: uuidv4(),
            task_id: taskId,
            task_title: taskTitle || "Unnamed Task",
            start_time: new Date(Date.now() - fallbackSessionTimeSpent * 1000).toISOString(),
            duration: fallbackSessionTimeSpent,
            completed: fallbackTimeLeft === 0,
            user_id: user?.id,
          })

          if (error) {
            console.error("Error saving pomodoro session:", error)
            toast({
              title: "Error saving session",
              description: "Your time was not saved. Please try again.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Session saved",
              description: `Saved ${Math.floor(fallbackSessionTimeSpent / 60)}m ${fallbackSessionTimeSpent % 60}s for "${taskTitle || "Unnamed Task"}"`,
            })

            // Update task time_spent
            const { data, error: fetchError } = await supabase
              .from("tasks")
              .select("time_spent")
              .eq("id", taskId)
              .single()

            if (!fetchError && data) {
              const currentTimeSpent = data.time_spent || 0
              await supabase
                .from("tasks")
                .update({ time_spent: currentTimeSpent + fallbackSessionTimeSpent })
                .eq("id", taskId)
            }
          }
        } catch (err) {
          console.error("Error saving pomodoro session:", err)
          toast({
            title: "Error saving session",
            description: "Your time was not saved. Please try again.",
            variant: "destructive",
          })
        }
      }

      setFallbackIsRunning(false)
      return Promise.resolve()
    },
    setCurrentTask = () => {},
    setShowMiniTimer = () => {},
  } = pomodoroContext || {}

  // Set the current task when the component mounts or taskId/taskTitle changes
  useEffect(() => {
    if (pomodoroContext && (taskId || taskTitle)) {
      console.log("Setting current task:", taskId, taskTitle)
      setCurrentTask(taskId, taskTitle)
      setShowMiniTimer(true)
    }
  }, [taskId, taskTitle, pomodoroContext, setCurrentTask, setShowMiniTimer])

  // Fallback timer implementation when context is not available
  useEffect(() => {
    if (!pomodoroContext && fallbackIsRunning) {
      const interval = setInterval(() => {
        const now = Date.now()
        if (lastTickTime) {
          const elapsed = Math.floor((now - lastTickTime) / 1000)
          setFallbackTimeLeft((prev) => Math.max(0, prev - 1))
          setFallbackSessionTimeSpent((prev) => prev + 1)

          // If timer reaches zero, stop it
          if (fallbackTimeLeft <= 1) {
            setFallbackIsRunning(false)
            clearInterval(interval)

            // Notify completion
            toast({
              title: "Pomodoro completed!",
              description: "Time to take a break.",
            })
          }
        }
        setLastTickTime(now)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [fallbackIsRunning, fallbackTimeLeft, lastTickTime, pomodoroContext, toast])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalDuration = timerMode === "work" ? 25 * 60 : timerMode === "shortBreak" ? 5 * 60 : 15 * 60
    return (timeLeft / totalDuration) * 100
  }

  // Handle start with logging
  const handleStart = () => {
    console.log("Start button clicked")
    startTimer()
  }

  // Handle pause with logging
  const handlePause = () => {
    console.log("Pause button clicked")
    pauseTimer()
  }

  // Handle stop and save with callbacks
  const handleStopAndSave = async () => {
    console.log("Stop and save button clicked")
    await stopAndSave()

    if (onTimeSpent && currentSessionTimeSpent > 0) {
      onTimeSpent(currentSessionTimeSpent)
    }

    if (onComplete) {
      onComplete()
    }
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn("text-sm font-mono w-16 text-center", timerMode !== "work" ? "text-blue-500" : "text-red-500")}
        >
          {formatTime(timeLeft)}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={isRunning ? handlePause : handleStart}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={resetTimer}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={handleStopAndSave}>
          <StopCircle className="h-4 w-4" />
        </Button>
      </div>
    )
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
              onClick={() => {
                console.log("Focus button clicked")
                if (timerMode !== "work") {
                  resetTimer()
                  skipPhase("work")
                }
              }}
            >
              <Timer className="h-4 w-4 mr-1" />
              Focus
            </Button>
            <Button
              variant={timerMode !== "work" ? "default" : "outline"}
              size="sm"
              className={timerMode !== "work" ? "bg-blue-500 hover:bg-blue-600" : ""}
              onClick={() => {
                console.log("Break button clicked")
                if (timerMode === "work") {
                  skipPhase("shortBreak")
                }
              }}
            >
              <Coffee className="h-4 w-4 mr-1" />
              Break
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={isRunning ? "outline" : "default"}
              size="sm"
              onClick={isRunning ? handlePause : handleStart}
              className="min-w-[80px]"
            >
              {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetTimer}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Skip button clicked")
                skipPhase()
              }}
            >
              Skip
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={handleStopAndSave}
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Stop & Save
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {timerMode === "work" ? "Focus Time" : timerMode === "shortBreak" ? "Short Break" : "Long Break"} •{" "}
            {completedSessions} sessions completed
          </div>

          {timerMode === "work" && currentSessionTimeSpent > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Current session: {Math.floor(currentSessionTimeSpent / 60)}m {currentSessionTimeSpent % 60}s
            </div>
          )}

          {totalTimeSpent > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Total time: {Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

