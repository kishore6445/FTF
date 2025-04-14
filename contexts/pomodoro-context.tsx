"use client"
export const dynamic = "force-dynamic";

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

type TimerMode = "work" | "shortBreak" | "longBreak"

interface PomodoroContextType {
  isRunning: boolean
  isPaused: boolean
  isCompleted: boolean
  timerMode: TimerMode
  timeLeft: number
  completedSessions: number
  currentSessionTimeSpent: number
  totalTimeSpent: number
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipPhase: (targetMode?: TimerMode) => void
  stopAndSave: () => Promise<void>
  showMiniTimer: boolean
  setShowMiniTimer: (show: boolean) => void
  currentTaskId?: string
  currentTaskTitle?: string
  setCurrentTask: (taskId?: string, taskTitle?: string) => void
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  // Timer configuration
  const workDuration = 25 * 60 // 25 minutes in seconds
  const shortBreakDuration = 5 * 60 // 5 minutes in seconds
  const longBreakDuration = 15 * 60 // 15 minutes in seconds
  const sessionsBeforeLongBreak = 4

  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timerMode, setTimerMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(workDuration)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [currentSessionTimeSpent, setCurrentSessionTimeSpent] = useState(0)
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)
  const [showMiniTimer, setShowMiniTimer] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>()
  const [currentTaskTitle, setCurrentTaskTitle] = useState<string | undefined>()

  // References for timer management
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickRef = useRef<number | null>(null)

  // Timer effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Start a new interval if the timer is running
    if (isRunning) {
      console.log("Starting timer interval")
      lastTickRef.current = Date.now()

      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = lastTickRef.current ? Math.floor((now - lastTickRef.current) / 1000) : 0
        lastTickRef.current = now

        // Update time left
        setTimeLeft((prev) => {
          const newTimeLeft = Math.max(0, prev - elapsed)

          // If timer reached zero
          if (newTimeLeft === 0 && prev > 0) {
            // Play sound notification
            try {
              const audio = new Audio("/notification.mp3")
              audio.play()
            } catch (e) {
              console.error("Could not play notification sound:", e)
            }

            // Show toast notification
            toast({
              title: timerMode === "work" ? "Work session completed!" : "Break time is over!",
              description:
                timerMode === "work" ? "Great job! Time for a break." : "Break's over. Ready to focus again?",
            })

            // Handle timer completion
            if (timerMode === "work") {
              // Increment completed sessions
              setCompletedSessions((prevSessions) => {
                const newSessions = prevSessions + 1
                // Determine next break type
                const nextMode = newSessions % sessionsBeforeLongBreak === 0 ? "longBreak" : "shortBreak"

                // Switch to break mode
                setTimerMode(nextMode)
                setTimeLeft(nextMode === "longBreak" ? longBreakDuration : shortBreakDuration)
                return newSessions
              })
            } else {
              // Switch back to work mode after break
              setTimerMode("work")
              setTimeLeft(workDuration)
            }

            // Stop the timer when it reaches zero
            clearInterval(intervalRef.current!)
            intervalRef.current = null
            setIsRunning(false)
          }

          return newTimeLeft
        })

        // Update time spent for work sessions
        if (timerMode === "work") {
          setCurrentSessionTimeSpent((prev) => prev + elapsed)
          setTotalTimeSpent((prev) => prev + elapsed)
        }
      }, 1000)
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, timerMode, workDuration, shortBreakDuration, longBreakDuration, sessionsBeforeLongBreak, toast])

  // Timer control functions
  const startTimer = () => {
    console.log("startTimer called")
    setIsRunning(true)
    setIsPaused(false)
    setIsCompleted(false)
    lastTickRef.current = Date.now()
  }

  const pauseTimer = () => {
    console.log("pauseTimer called")
    setIsRunning(false)
    setIsPaused(true)
  }

  const resetTimer = () => {
    console.log("resetTimer called")
    setIsRunning(false)
    setIsPaused(false)
    setIsCompleted(false)

    if (timerMode === "work") {
      setTimeLeft(workDuration)
    } else if (timerMode === "shortBreak") {
      setTimeLeft(shortBreakDuration)
    } else {
      setTimeLeft(longBreakDuration)
    }

    setCurrentSessionTimeSpent(0)
  }

  const skipPhase = (targetMode?: TimerMode) => {
    console.log("skipPhase called", targetMode)
    setIsRunning(false)
    setIsPaused(false)
    setIsCompleted(false)

    const newMode = targetMode || (timerMode === "work" ? "shortBreak" : "work")
    setTimerMode(newMode)

    if (newMode === "work") {
      setTimeLeft(workDuration)
    } else if (newMode === "shortBreak") {
      setTimeLeft(shortBreakDuration)
    } else {
      setTimeLeft(longBreakDuration)
    }

    setCurrentSessionTimeSpent(0)
  }

  const stopAndSave = async () => {
    console.log("stopAndSave called")
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsRunning(false)
    setIsPaused(false)
    setIsCompleted(true)

    // Only save if we have a task and some time was spent
    if (currentTaskId && currentSessionTimeSpent > 0) {
      try {
        const { error } = await supabase.from("pomodoro_sessions").insert({
          task_id: currentTaskId,
          task_title: currentTaskTitle || "Unnamed Task",
          start_time: new Date(Date.now() - currentSessionTimeSpent * 1000).toISOString(),
          duration: currentSessionTimeSpent,
          completed: timeLeft === 0,
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
            description: `Saved ${Math.floor(currentSessionTimeSpent / 60)}m ${currentSessionTimeSpent % 60}s for "${currentTaskTitle || "Unnamed Task"}"`,
          })

          // Update the task's time spent in the tasks table
          try {
            const { data: task, error: taskError } = await supabase
              .from("tasks")
              .select("time_spent")
              .eq("id", currentTaskId)
              .single()

            if (!taskError && task) {
              const currentTimeSpent = task.time_spent || 0
              const newTimeSpent = currentTimeSpent + currentSessionTimeSpent

              await supabase.from("tasks").update({ time_spent: newTimeSpent }).eq("id", currentTaskId)
            }
          } catch (err) {
            console.error("Error updating task time spent:", err)
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

    return Promise.resolve()
  }

  const setCurrentTask = (taskId?: string, taskTitle?: string) => {
    setCurrentTaskId(taskId)
    setCurrentTaskTitle(taskTitle)
  }

  // Context value
  const value: PomodoroContextType = {
    isRunning,
    isPaused,
    isCompleted,
    timerMode,
    timeLeft,
    completedSessions,
    currentSessionTimeSpent,
    totalTimeSpent,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    stopAndSave,
    showMiniTimer,
    setShowMiniTimer,
    currentTaskId,
    currentTaskTitle,
    setCurrentTask,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider")
  }
  return context
}

export { PomodoroContext }

