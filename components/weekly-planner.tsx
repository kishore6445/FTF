"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, ChevronLeft, ChevronRight, Plus, Save, X, Check } from "lucide-react"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Task } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

export default function WeeklyPlanner() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<"week" | "day">("week")
  const [newTasks, setNewTasks] = useState<Record<string, { title: string; saving: boolean }>>({})
  const [newDailyTask, setNewDailyTask] = useState("")
  const [savingDailyTask, setSavingDailyTask] = useState(false)
  const [showDailyInput, setShowDailyInput] = useState(false)

  // Calculate week dates
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd })

  // Format date range for display
  const dateRangeText = `${format(currentWeekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, currentWeekStart])

  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Format dates for query
      const startDate = format(currentWeekStart, "yyyy-MM-dd")
      const endDate = format(weekEnd, "yyyy-MM-dd")

      // Fetch tasks for the current week
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .or(`due_date.gte.${startDate},due_date.lte.${endDate}`)
        .order("due_date", { ascending: true })

      if (error) throw error

      // Transform data
      const transformedTasks = (data || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        quadrant: task.quadrant,
        roleId: task.role_id,
        completed: task.completed || false,
        timeSpent: task.time_spent || 0,
        subtasks: [],
        userId: task.user_id,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        dueDate: task.due_date,
        recurrenceId: task.recurrence_id,
        isRitual: task.is_ritual || false,
      }))

      setTasks(transformedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  const handleAddTask = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    setNewTasks((prev) => ({
      ...prev,
      [dateKey]: { title: "", saving: false },
    }))
  }

  const handleTaskInputChange = (dateKey: string, value: string) => {
    setNewTasks((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], title: value },
    }))
  }

  const handleCancelNewTask = (dateKey: string) => {
    setNewTasks((prev) => {
      const updated = { ...prev }
      delete updated[dateKey]
      return updated
    })
  }

  const handleSaveTask = async (dateKey: string) => {
    if (!user || !newTasks[dateKey]?.title.trim()) return

    setNewTasks((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], saving: true },
    }))

    try {
      const newTask = {
        id: uuidv4(),
        title: newTasks[dateKey].title.trim(),
        description: "",
        quadrant: "q2",
        completed: false,
        time_spent: 0,
        user_id: user.id,
        due_date: dateKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("tasks").insert(newTask).select().single()

      if (error) throw error

      // Add the new task to the state
      const transformedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        quadrant: data.quadrant,
        roleId: data.role_id,
        completed: data.completed || false,
        timeSpent: data.time_spent || 0,
        subtasks: [],
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        dueDate: data.due_date,
        recurrenceId: data.recurrence_id,
        isRitual: data.is_ritual || false,
      }

      setTasks((prev) => [...prev, transformedTask])

      // Clear the input
      handleCancelNewTask(dateKey)
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleAddDailyTask = () => {
    setShowDailyInput(true)
  }

  const handleSaveDailyTask = async () => {
    if (!user || !newDailyTask.trim() || !selectedDate) return

    setSavingDailyTask(true)

    try {
      const dateKey = format(selectedDate, "yyyy-MM-dd")
      const newTask = {
        id: uuidv4(),
        title: newDailyTask.trim(),
        description: "",
        quadrant: "q2",
        completed: false,
        time_spent: 0,
        user_id: user.id,
        due_date: dateKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("tasks").insert(newTask).select().single()

      if (error) throw error

      // Add the new task to the state
      const transformedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        quadrant: data.quadrant,
        roleId: data.role_id,
        completed: data.completed || false,
        timeSpent: data.time_spent || 0,
        subtasks: [],
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        dueDate: data.due_date,
        recurrenceId: data.recurrence_id,
        isRitual: data.is_ritual || false,
      }

      setTasks((prev) => [...prev, transformedTask])

      // Clear the input
      setNewDailyTask("")
      setShowDailyInput(false)
    } catch (error) {
      console.error("Error saving task:", error)
    } finally {
      setSavingDailyTask(false)
    }
  }

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), date))
  }

  const renderDayView = () => {
    if (!selectedDate) return null

    const dayTasks = getTasksForDay(selectedDate)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{format(selectedDate, "EEEE, MMMM d")}</h3>
          <Button size="sm" onClick={() => setView("week")}>
            Back to Week
          </Button>
        </div>

        <div className="space-y-2">
          {dayTasks.map((task) => (
            <Card key={task.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </h4>
                  {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                </div>
                <Badge variant={task.completed ? "outline" : "default"}>{task.quadrant.toUpperCase()}</Badge>
              </div>
            </Card>
          ))}

          {dayTasks.length === 0 && !showDailyInput && (
            <p className="text-center text-muted-foreground py-4">No tasks scheduled for this day</p>
          )}
        </div>

        {showDailyInput ? (
          <div className="flex items-center gap-2 mt-4 border p-3 rounded-md bg-muted/20">
            <Input
              value={newDailyTask}
              onChange={(e) => setNewDailyTask(e.target.value)}
              placeholder="Enter task title"
              autoFocus
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newDailyTask.trim()) {
                  handleSaveDailyTask()
                }
              }}
            />
            <Button size="icon" variant="ghost" onClick={() => setShowDailyInput(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSaveDailyTask}
              className="h-8 w-8"
              disabled={!newDailyTask.trim() || savingDailyTask}
            >
              {savingDailyTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <Button variant="default" className="w-full mt-4" onClick={handleAddDailyTask} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add New Task
          </Button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (view === "day" && selectedDate) {
    return (
      <Card>
        <CardContent className="p-4">{renderDayView()}</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Weekly Planner</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{dateRangeText}</span>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day)
            const isToday = isSameDay(day, new Date())
            const dateKey = format(day, "yyyy-MM-dd")
            const isAddingTask = Boolean(newTasks[dateKey])

            return (
              <div
                key={day.toString()}
                className={`border rounded-md p-2 min-h-[120px] ${isToday ? "bg-primary/5 border-primary/20" : ""}`}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                  <div className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{format(day, "d")}</div>
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:bg-muted ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                      onClick={() => {
                        setSelectedDate(day)
                        setView("day")
                      }}
                    >
                      {task.title}
                    </div>
                  ))}

                  {dayTasks.length > 3 && (
                    <div
                      className="text-xs text-center text-muted-foreground cursor-pointer hover:text-primary"
                      onClick={() => {
                        setSelectedDate(day)
                        setView("day")
                      }}
                    >
                      +{dayTasks.length - 3} more
                    </div>
                  )}

                  {isAddingTask ? (
                    <div className="mt-1 space-y-1">
                      <Input
                        value={newTasks[dateKey].title}
                        onChange={(e) => handleTaskInputChange(dateKey, e.target.value)}
                        placeholder="Task title"
                        size={1}
                        className="h-6 text-xs"
                      />
                      <div className="flex justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelNewTask(dateKey)}
                          className="h-5 w-5"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          onClick={() => handleSaveTask(dateKey)}
                          className="h-5 w-5"
                          disabled={!newTasks[dateKey].title.trim() || newTasks[dateKey].saving}
                        >
                          {newTasks[dateKey].saving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 text-xs mt-1"
                      onClick={() => handleAddTask(day)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

