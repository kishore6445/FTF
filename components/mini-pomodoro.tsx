"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react"

interface MiniPomodoroProps {
  taskId: string
  onComplete?: (taskId: string, duration: number) => void
  defaultDuration?: number // in minutes
}

export default function MiniPomodoro({ taskId, onComplete, defaultDuration = 25 }: MiniPomodoroProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(defaultDuration * 60) // in seconds
  const [isCompleted, setIsCompleted] = useState(false)
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startTimer = () => {
    if (!isRunning && timeLeft > 0) {
      setIsRunning(true)
      startTimeRef.current = Date.now() - (defaultDuration * 60 - timeLeft) * 1000

      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }
  }

  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
      setIsRunning(false)

      // Calculate time spent in this session
      if (startTimeRef.current) {
        const sessionTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setTotalTimeSpent((prev) => prev + sessionTime)
      }
    }
  }

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsRunning(false)
    setTimeLeft(defaultDuration * 60)
    setIsCompleted(false)
    startTimeRef.current = null
  }

  const handleComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setIsRunning(false)
    setIsCompleted(true)

    // Calculate total time spent
    const finalTimeSpent =
      totalTimeSpent + (startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0)

    setTotalTimeSpent(finalTimeSpent)

    // Call the onComplete callback
    if (onComplete) {
      onComplete(taskId, Math.floor(finalTimeSpent / 60))
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = ((defaultDuration * 60 - timeLeft) / (defaultDuration * 60)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-mono font-semibold">{formatTime(timeLeft)}</div>
        {isCompleted && (
          <span className="text-xs text-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        )}
      </div>

      <Progress value={progressPercentage} className="h-2 mb-3" />

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {isCompleted ? "Completed!" : isRunning ? "Focus on this task..." : "Start timer to focus"}
        </div>

        <div className="flex space-x-2">
          {!isCompleted ? (
            <>
              {isRunning ? (
                <Button variant="outline" size="sm" onClick={pauseTimer}>
                  <Pause className="h-3.5 w-3.5 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={startTimer}>
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Start
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={resetTimer}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={resetTimer} className="text-green-600">
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              New Timer
            </Button>
          )}
        </div>
      </div>

      {totalTimeSpent > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          Total time: {Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s
        </div>
      )}
    </div>
  )
}

