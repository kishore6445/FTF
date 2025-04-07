"use client"

import { useContext } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw, X, Timer, StopCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PomodoroContext } from "@/contexts/pomodoro-context"

export function PersistentMiniTimer() {
  const router = useRouter()
  const pomodoroContext = useContext(PomodoroContext)

  if (!pomodoroContext || !pomodoroContext.showMiniTimer) {
    return null
  }

  const {
    isRunning,
    timerMode,
    timeLeft,
    currentTaskTitle,
    startTimer,
    pauseTimer,
    resetTimer,
    stopAndSave,
    setShowMiniTimer,
  } = pomodoroContext

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleFullTimerClick = () => {
    router.push("/pomodoro")
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 shadow-lg p-3 flex items-center gap-2 max-w-xs">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className={cn(
            "w-3 h-3 rounded-full",
            timerMode === "work" ? "bg-red-500" : timerMode === "shortBreak" ? "bg-blue-400" : "bg-blue-600",
          )}
        />

        <div className="flex flex-col min-w-0">
          <div className={cn("text-lg font-mono", timerMode === "work" ? "text-red-500" : "text-blue-500")}>
            {formatTime(timeLeft)}
          </div>

          {currentTaskTitle && <div className="text-xs text-muted-foreground truncate">{currentTaskTitle}</div>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={isRunning ? pauseTimer : startTimer}>
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetTimer}>
          <RotateCcw className="h-3 w-3" />
        </Button>

        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => stopAndSave()}>
          <StopCircle className="h-3 w-3" />
        </Button>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFullTimerClick}>
          <Timer className="h-3 w-3" />
        </Button>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowMiniTimer(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  )
}

