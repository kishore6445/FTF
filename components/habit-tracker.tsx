"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Flame, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import type { Task } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface HabitTrackerProps {
  tasks: Task[]
  onToggleTaskCompletion: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export default function HabitTracker({ tasks, onToggleTaskCompletion, onDeleteTask }: HabitTrackerProps) {
  const { user } = useAuth()
  const [ritualTasks, setRitualTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate] = useState(new Date())
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [completionHistory, setCompletionHistory] = useState<Record<string, string[]>>({})
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRitualName, setNewRitualName] = useState("")

  // Initialize week dates
  useEffect(() => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
    const dates = Array(7)
      .fill(0)
      .map((_, i) => addDays(startDate, i))
    setWeekDates(dates)
  }, [currentDate])

  // Filter ritual tasks from all tasks
  useEffect(() => {
    const rituals = tasks.filter((task) => task.isRitual && task.quadrant === "q2")
    setRitualTasks(rituals)
    setIsLoading(false)
  }, [tasks])

  // Fetch completion history for rituals
  useEffect(() => {
    if (!user || ritualTasks.length === 0) return

    const fetchCompletionHistory = async () => {
      try {
        // This would be a real API call in a production app
        // For now, we'll simulate completion history with local data
        const history: Record<string, string[]> = {}
        const taskStreaks: Record<string, number> = {}

        // Simulate fetching completion history
        ritualTasks.forEach((task) => {
          // Generate some random completion dates for the last 30 days
          const completedDates = []
          let streak = 0

          // If the task is completed today, add today's date
          if (task.completed) {
            completedDates.push(format(new Date(), "yyyy-MM-dd"))
            streak = 1
          }

          // Add some random past dates (for demo purposes)
          for (let i = 1; i < 30; i++) {
            if (Math.random() > 0.5) {
              const date = format(addDays(new Date(), -i), "yyyy-MM-dd")
              completedDates.push(date)
              if (i === streak) {
                streak++
              } else {
                break
              }
            } else if (streak > 0) {
              break
            }
          }

          history[task.id] = completedDates
          taskStreaks[task.id] = streak
        })

        setCompletionHistory(history)
        setStreaks(taskStreaks)
      } catch (error) {
        console.error("Error fetching completion history:", error)
        setError("Failed to load habit history")
      }
    }

    fetchCompletionHistory()
  }, [user, ritualTasks])

  const handleAddRitual = async () => {
    if (!user || !newRitualName.trim()) return

    try {
      // In a real app, this would add a new task to the database
      // For now, we'll just close the dialog
      setIsAddDialogOpen(false)
      setNewRitualName("")

      // Show a message that this would normally add a ritual
      setError(
        "This would add a new ritual in a real app. For now, please use the Add Task button in the main interface and select 'Add as ritual'.",
      )
    } catch (error) {
      console.error("Error adding ritual:", error)
      setError("Failed to add ritual")
    }
  }

  const isDateCompleted = (taskId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return completionHistory[taskId]?.includes(dateStr) || false
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Daily Habits & Rituals</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ritual
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {ritualTasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No rituals added yet.</p>
            <p className="text-sm mt-2">Add Q2 tasks as rituals to track them here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Habit Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 min-w-[200px]">Habit</th>
                    <th className="text-center p-2 w-[50px]">Streak</th>
                    {weekDates.map((date) => (
                      <th key={date.toString()} className="text-center p-2 w-[50px]">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">{format(date, "EEE")}</span>
                          <span className={`text-sm ${isSameDay(date, new Date()) ? "font-bold" : ""}`}>
                            {format(date, "d")}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {ritualTasks.map((task) => (
                    <tr key={task.id} className="border-t">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={task.completed} onCheckedChange={() => onToggleTaskCompletion(task.id)} />
                          <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{streaks[task.id] || 0}</span>
                          </Badge>
                        </div>
                      </td>
                      {weekDates.map((date) => (
                        <td key={date.toString()} className="text-center p-2">
                          {isDateCompleted(task.id, date) ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                      <td className="p-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-0">
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => onDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Ritual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ritual-name">Ritual Name</Label>
              <Input
                id="ritual-name"
                value={newRitualName}
                onChange={(e) => setNewRitualName(e.target.value)}
                placeholder="e.g., Morning Meditation"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Rituals are important but not urgent tasks (Q2) that you want to track daily.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRitual}>Add Ritual</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

