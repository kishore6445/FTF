"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Task } from "@/lib/types"
import AddTaskDialog from "@/components/add-task-dialog"

export default function MonthlyPlanner() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Calculate month dates
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate days from previous and next month to fill the calendar grid
  const startDay = getDay(monthStart)
  const daysInMonth = monthDays.length
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7

  // Format month for display
  const monthText = format(currentMonth, "MMMM yyyy")

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, currentMonth])

  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Format dates for query
      const startDate = format(monthStart, "yyyy-MM-dd")
      const endDate = format(monthEnd, "yyyy-MM-dd")

      // Fetch tasks for the current month
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

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleAddTask = (date: Date) => {
    setSelectedDate(date)
    setShowAddTask(true)
  }

  const handleTaskAdded = () => {
    fetchTasks()
    setShowAddTask(false)
  }

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), date))
  }

  // Generate calendar cells
  const calendarCells = []
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Add day names
  for (let i = 0; i < 7; i++) {
    calendarCells.push(
      <div key={`header-${i}`} className="text-center font-medium text-xs p-1">
        {dayNames[i]}
      </div>,
    )
  }

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(
      <div
        key={`empty-start-${i}`}
        className="border border-dashed border-gray-200 p-1 min-h-[80px] bg-gray-50/50"
      ></div>,
    )
  }

  // Add cells for days in the month
  monthDays.forEach((day) => {
    const dayTasks = getTasksForDay(day)
    const isToday = isSameDay(day, new Date())

    calendarCells.push(
      <div
        key={day.toString()}
        className={`border p-1 min-h-[80px] ${isToday ? "bg-primary/5 border-primary/20" : ""}`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{format(day, "d")}</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleAddTask(day)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-1">
          {dayTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className={`text-xs p-1 rounded truncate ${
                task.completed ? "line-through text-muted-foreground" : "bg-primary/10"
              }`}
            >
              {task.title}
            </div>
          ))}

          {dayTasks.length > 3 && (
            <div className="text-xs text-center text-muted-foreground">+{dayTasks.length - 3} more</div>
          )}
        </div>
      </div>,
    )
  })

  // Add empty cells for days after the last of the month
  const remainingCells = totalCells - (startDay + daysInMonth)
  for (let i = 0; i < remainingCells; i++) {
    calendarCells.push(
      <div
        key={`empty-end-${i}`}
        className="border border-dashed border-gray-200 p-1 min-h-[80px] bg-gray-50/50"
      ></div>,
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Planner
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{monthText}</span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">{calendarCells}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-primary/10">
            Q1: Urgent & Important
          </Badge>
          <Badge variant="outline" className="bg-blue-100">
            Q2: Important, Not Urgent
          </Badge>
          <Badge variant="outline" className="bg-amber-100">
            Q3: Urgent, Not Important
          </Badge>
          <Badge variant="outline" className="bg-green-100">
            Q4: Not Urgent, Not Important
          </Badge>
        </div>
      </CardContent>

      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        onTaskAdded={handleTaskAdded}
        defaultQuadrant="q2"
        userId={user?.id}
        initialDueDate={selectedDate}
      />
    </Card>
  )
}

