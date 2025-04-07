"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Settings, Volume2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Task } from "@/lib/types"

interface SimplifiedPomodoroTimerProps {
  tasks: Task[]
  onSelectTask: (taskId: string) => void
  onSaveSession: (data: {
    taskId: string
    duration: number
    completed: boolean
  }) => void
}

export default function SimplifiedPomodoroTimer({ tasks, onSelectTask, onSaveSession }: SimplifiedPomodoroTimerProps) {
  // Timer states
  const [mode, setMode] = useState<"focus" | "break" | "longBreak">("focus")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)

  // Settings
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4)
  const [volume, setVolume] = useState(80)
  const [autoStartBreaks, setAutoStartBreaks] = useState(true)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false)

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/bell.mp3") // Assuming you have a bell sound file
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Set initial time based on mode
  useEffect(() => {
    if (mode === "focus") {
      setTimeLeft(focusDuration * 60)
    } else if (mode === "break") {
      setTimeLeft(breakDuration * 60)
    } else {
      setTimeLeft(longBreakDuration * 60)
    }
  }, [mode, focusDuration, breakDuration, longBreakDuration])

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            clearInterval(timerRef.current as NodeJS.Timeout)

            // Play sound
            if (audioRef.current) {
              audioRef.current.volume = volume / 100
              audioRef.current.play()
            }

            // Handle session completion
            if (mode === "focus") {
              // Save completed session
              if (selectedTaskId) {
                onSaveSession({
                  taskId: selectedTaskId,
                  duration: focusDuration,
                  completed: true,
                })
              }

              // Increment sessions counter
              const newSessionsCompleted = sessionsCompleted + 1
              setSessionsCompleted(newSessionsCompleted)

              // Determine next break type
              if (newSessionsCompleted % sessionsBeforeLongBreak === 0) {
                setMode("longBreak")
                if (autoStartBreaks) {
                  return longBreakDuration * 60
                }
              } else {
                setMode("break")
                if (autoStartBreaks) {
                  return breakDuration * 60
                }
              }
            } else {
              // Break completed, go back to focus mode
              setMode("focus")
              if (autoStartPomodoros) {
                return focusDuration * 60
              }
            }

            // Stop timer if not auto-starting
            setIsRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [
    isRunning,
    mode,
    focusDuration,
    breakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    volume,
    autoStartBreaks,
    autoStartPomodoros,
    selectedTaskId,
    sessionsCompleted,
    onSaveSession,
  ])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const totalSeconds =
      mode === "focus" ? focusDuration * 60 : mode === "break" ? breakDuration * 60 : longBreakDuration * 60

    return Math.max(0, Math.min(100, ((totalSeconds - timeLeft) / totalSeconds) * 100))
  }

  // Handle start/pause
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // Handle reset
  const resetTimer = () => {
    setIsRunning(false)
    if (mode === "focus") {
      setTimeLeft(focusDuration * 60)
    } else if (mode === "break") {
      setTimeLeft(breakDuration * 60)
    } else {
      setTimeLeft(longBreakDuration * 60)
    }
  }

  // Handle task selection
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId)
    onSelectTask(taskId)
  }

  // Get active tasks
  const activeTasks = tasks.filter((task) => !task.completed)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Pomodoro Timer</h1>
        <Button variant="outline" onClick={() => setShowSettings(true)} className="gap-1">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">
            {mode === "focus" ? "Focus Time" : mode === "break" ? "Short Break" : "Long Break"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* Timer Display */}
            <div className="text-6xl font-bold tabular-nums mb-4">{formatTime(timeLeft)}</div>

            {/* Progress Bar */}
            <Progress value={getProgressPercentage()} className="w-full h-2 mb-6" />

            {/* Controls */}
            <div className="flex items-center gap-4 mb-6">
              <Button size="lg" onClick={toggleTimer} className="h-12 w-12 rounded-full p-0">
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button variant="outline" size="icon" onClick={resetTimer} className="h-10 w-10 rounded-full">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

            {/* Mode Selector */}
            <Tabs
              value={mode}
              onValueChange={(value) => {
                setMode(value as "focus" | "break" | "longBreak")
                setIsRunning(false)
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="focus">Focus</TabsTrigger>
                <TabsTrigger value="break">Break</TabsTrigger>
                <TabsTrigger value="longBreak">Long Break</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Session Counter */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Sessions completed: {sessionsCompleted}</p>
            </div>

            {/* Task Selection (only in focus mode) */}
            {mode === "focus" && (
              <div className="w-full mt-4">
                <label className="text-sm font-medium mb-1 block">Select Task (optional)</label>
                <Select value={selectedTaskId} onValueChange={handleTaskSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task to focus on" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-task">No task selected</SelectItem>
                    {activeTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Focus Duration (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[focusDuration]}
                  min={5}
                  max={60}
                  step={5}
                  onValueChange={(value) => setFocusDuration(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{focusDuration}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Break Duration (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[breakDuration]}
                  min={1}
                  max={15}
                  step={1}
                  onValueChange={(value) => setBreakDuration(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{breakDuration}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Long Break Duration (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[longBreakDuration]}
                  min={5}
                  max={30}
                  step={5}
                  onValueChange={(value) => setLongBreakDuration(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{longBreakDuration}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sessions Before Long Break</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[sessionsBeforeLongBreak]}
                  min={2}
                  max={6}
                  step={1}
                  onValueChange={(value) => setSessionsBeforeLongBreak(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{sessionsBeforeLongBreak}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Volume</Label>
              <div className="flex items-center gap-4">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={10}
                  onValueChange={(value) => setVolume(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{volume}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-start-breaks">Auto-start Breaks</Label>
              <Switch id="auto-start-breaks" checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-start-pomodoros">Auto-start Pomodoros</Label>
              <Switch id="auto-start-pomodoros" checked={autoStartPomodoros} onCheckedChange={setAutoStartPomodoros} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

