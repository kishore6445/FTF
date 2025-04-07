"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pause, Play, RotateCcw, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

interface TaskTimerProps {
  taskId: string
  taskTitle: string
  onTimeUpdate?: (seconds: number) => void
}

export function TaskTimer({ taskId, taskTitle, onTimeUpdate }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Load existing time spent when component mounts
  useEffect(() => {
    const loadTimeSpent = async () => {
      try {
        const { data, error } = await supabase.from("tasks").select("time_spent").eq("id", taskId).single()

        if (error) {
          console.error("Error loading time spent:", error)
          return
        }

        if (data && data.time_spent) {
          setElapsedTime(data.time_spent)
        }
      } catch (err) {
        console.error("Error loading time spent:", err)
      }
    }

    loadTimeSpent()
  }, [taskId])

  // Format time as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
  }

  // Start the timer
  const startTimer = async () => {
    if (isRunning) return

    try {
      // Create a new session in the database
      const newSessionId = uuidv4()
      const startTime = new Date().toISOString()

      // Get user ID from auth
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.from("pomodoro_sessions").insert({
        id: newSessionId,
        task_id: taskId,
        task_title: taskTitle,
        start_time: startTime,
        duration: 0,
        completed: false,
        user_id: user?.id,
      })

      if (error) {
        console.error("Error creating timer session:", error)
        // Continue anyway - the timer will still work locally
      }

      // Set the session ID and start time
      setSessionId(newSessionId)
      startTimeRef.current = Date.now()
      setIsRunning(true)

      // Start the timer interval
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000) + elapsedTime
          setElapsedTime(currentElapsed)
          onTimeUpdate?.(currentElapsed)
        }
      }, 1000)
    } catch (err) {
      console.error("Error starting timer:", err)
      toast({
        title: "Error",
        description: "Failed to start timer. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Pause the timer
  const pauseTimer = async () => {
    if (!isRunning) return

    try {
      // Clear the interval
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Calculate the duration for this session
      const sessionDuration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0

      // Update the session in the database if we have a session ID
      if (sessionId) {
        const { error } = await supabase
          .from("pomodoro_sessions")
          .update({
            duration: sessionDuration,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionId)

        if (error) {
          console.error("Error updating timer session:", error)
          // Continue anyway - we'll still update the task
        }
      }

      // Update the task's time_spent
      await updateTaskTimeSpent(taskId, elapsedTime)

      setIsRunning(false)
      startTimeRef.current = null
    } catch (err) {
      console.error("Error pausing timer:", err)
      toast({
        title: "Error",
        description: "Failed to pause timer. Please try again.",
        variant: "destructive",
      })

      // Still stop the timer locally
      setIsRunning(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  // Reset the timer
  const resetTimer = () => {
    if (isRunning) {
      pauseTimer()
    }

    setElapsedTime(0)
    startTimeRef.current = null
    setSessionId(null)
  }

  // Update the task's time_spent field
  const updateTaskTimeSpent = async (taskId: string, totalSeconds: number) => {
    try {
      const { error } = await supabase.from("tasks").update({ time_spent: totalSeconds }).eq("id", taskId)

      if (error) {
        console.error("Error updating task time:", error)
      }
    } catch (err) {
      console.error("Error updating task time spent:", err)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // If timer is still running when component unmounts, save the data
      if (isRunning) {
        pauseTimer()
      }
    }
  }, [isRunning])

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Task Timer</span>
            </div>
            <div className="text-2xl font-mono font-bold">{formatTime(elapsedTime)}</div>
          </div>

          <div className="flex space-x-2">
            {!isRunning ? (
              <Button onClick={startTimer} className="flex-1" variant="default">
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} className="flex-1" variant="secondary">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            <Button onClick={resetTimer} variant="outline" disabled={elapsedTime === 0}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

