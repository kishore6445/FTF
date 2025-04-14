"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, addYears, subYears, eachMonthOfInterval, startOfYear, endOfYear } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Task } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function YearlyPlanner() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentYear, setCurrentYear] = useState(new Date())
  const router = useRouter()

  // Calculate year dates
  const yearStart = startOfYear(currentYear)
  const yearEnd = endOfYear(currentYear)
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  // Format year for display
  const yearText = format(currentYear, "yyyy")

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, currentYear])

  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Format dates for query
      const startDate = format(yearStart, "yyyy-MM-dd")
      const endDate = format(yearEnd, "yyyy-MM-dd")

      // Fetch tasks for the current year
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .or(`due_date.gte.${startDate},due_date.lte.${endDate}`)

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

  const handlePreviousYear = () => {
    setCurrentYear(subYears(currentYear, 1))
  }

  const handleNextYear = () => {
    setCurrentYear(addYears(currentYear, 1))
  }

  const navigateToMonth = (month: Date) => {
    // Navigate to monthly view for the selected month
    router.push(`/planner/monthly?date=${format(month, "yyyy-MM-dd")}`)
  }

  // Calculate tasks per month
  const getTasksForMonth = (month: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate.getMonth() === month.getMonth() && taskDate.getFullYear() === month.getFullYear()
    })
  }

  // Calculate completion percentage for a month
  const getMonthCompletionPercentage = (month: Date) => {
    const monthTasks = getTasksForMonth(month)
    if (monthTasks.length === 0) return 0

    const completedTasks = monthTasks.filter((task) => task.completed)
    return Math.round((completedTasks.length / monthTasks.length) * 100)
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
            Yearly Planner
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">{yearText}</span>
            <Button variant="outline" size="sm" onClick={handleNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {months.map((month) => {
            const monthTasks = getTasksForMonth(month)
            const completionPercentage = getMonthCompletionPercentage(month)

            return (
              <Card
                key={month.toString()}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigateToMonth(month)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-center mb-2">{format(month, "MMMM")}</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Tasks: {monthTasks.length}</span>
                      <span>Completed: {completionPercentage}%</span>
                    </div>

                    <Progress value={completionPercentage} className="h-2" />

                    <div className="text-xs text-muted-foreground mt-2">
                      {monthTasks.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {monthTasks.slice(0, 3).map((task) => (
                            <li key={task.id} className="truncate">
                              {task.title}
                            </li>
                          ))}
                          {monthTasks.length > 3 && <li>+{monthTasks.length - 3} more tasks</li>}
                        </ul>
                      ) : (
                        <p className="text-center">No tasks scheduled</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

