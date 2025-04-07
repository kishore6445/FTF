"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { format, isToday, isThisWeek, isThisMonth, isPast } from "date-fns"
import type { Task, Role } from "@/lib/types"

interface CompletedTasksViewProps {
  tasks?: Task[]
  roles?: Role[]
  onReopenTask?: (taskId: string) => Promise<void>
}

export default function CompletedTasksView({ tasks = [], roles = [], onReopenTask }: CompletedTasksViewProps) {
  const { user } = useAuth()
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("today")
  const [fetchedFromDB, setFetchedFromDB] = useState(false)

  // Use the tasks prop directly if we're not fetching from the database
  useEffect(() => {
    if (!user || !user.id) {
      // If no user, use the tasks passed as props
      setCompletedTasks(Array.isArray(tasks) ? tasks.filter((task) => task.completed) : [])
      setIncompleteTasks(
        Array.isArray(tasks)
          ? tasks.filter((task) => !task.completed && task.dueDate && isPast(new Date(task.dueDate)))
          : [],
      )
      setLoading(false)
    } else if (!fetchedFromDB) {
      // Only fetch from DB once to prevent infinite loops
      fetchCompletedTasks()
    }
  }, [user, tasks, fetchedFromDB])

  const fetchCompletedTasks = async () => {
    if (!user || !user.id || fetchedFromDB) return

    try {
      setLoading(true)
      setError(null)

      // Fetch completed tasks - only select columns that definitely exist
      const { data: completedData, error: completedError } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          description,
          quadrant,
          role_id,
          completed,
          time_spent,
          created_at,
          updated_at
        `)
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("updated_at", { ascending: false })

      if (completedError) throw completedError

      // Transform data to match our client-side types
      const transformedCompletedTasks: Task[] = (completedData || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        quadrant: task.quadrant as "q1" | "q2" | "q3" | "q4",
        roleId: task.role_id || "",
        completed: task.completed,
        timeSpent: task.time_spent || 0,
        subtasks: [], // We're not fetching subtasks for simplicity
        userId: user.id,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }))

      setCompletedTasks(transformedCompletedTasks)

      // For incomplete tasks, we'll use the tasks prop since we can't query by due_date
      setIncompleteTasks(
        Array.isArray(tasks)
          ? tasks.filter((task) => !task.completed && task.dueDate && isPast(new Date(task.dueDate)))
          : [],
      )

      setFetchedFromDB(true) // Mark as fetched to prevent infinite loops
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to load tasks. Please try again.")
      // Fallback to props
      setCompletedTasks(Array.isArray(tasks) ? tasks.filter((task) => task.completed) : [])
      setIncompleteTasks(
        Array.isArray(tasks)
          ? tasks.filter((task) => !task.completed && task.dueDate && isPast(new Date(task.dueDate)))
          : [],
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReopenTask = async (taskId: string) => {
    if (onReopenTask) {
      try {
        await onReopenTask(taskId)
        // Remove from completed tasks
        setCompletedTasks((prev) => prev.filter((task) => task.id !== taskId))
      } catch (err) {
        console.error("Error reopening task:", err)
      }
    }
  }

  // Filter tasks by time period - memoized to prevent recalculation on every render
  const todayTasks = useMemo(() => {
    return completedTasks.filter((task) => task.updatedAt && isToday(new Date(task.updatedAt)))
  }, [completedTasks])

  const thisWeekTasks = useMemo(() => {
    return completedTasks.filter((task) => task.updatedAt && isThisWeek(new Date(task.updatedAt)))
  }, [completedTasks])

  const thisMonthTasks = useMemo(() => {
    return completedTasks.filter((task) => task.updatedAt && isThisMonth(new Date(task.updatedAt)))
  }, [completedTasks])

  // Get role color - with null checks
  const getRoleColor = (roleId?: string) => {
    if (!roleId || !Array.isArray(roles)) return "#e5e7eb" // Default gray color
    const role = roles.find((r) => r.id === roleId)
    return role?.color || "#e5e7eb" // Default gray color
  }

  // Get quadrant label
  // const getQuadrantLabel = (quadrant: string) => {
  //   switch (quadrant) {
  //     case "q1":
  //       return "Urgent & Important"
  //     case "q2":
  //       return "Not Urgent & Important"
  //     case "q3":
  //       return "Urgent & Not Important"
  //     case "q4":
  //       return "Not Urgent & Not Important"
  //     default:
  //       return quadrant
  //   }
  // }

  // Find role name safely
  const getRoleName = (roleId?: string) => {
    if (!roleId || !Array.isArray(roles)) return "Role"
    const role = roles.find((r) => r.id === roleId)
    return role?.name || "Role"
  }

  // Render task item
  const renderTaskItem = (task: Task, isIncomplete = false) => {
    if (!task) return null

    return (
      <div
        key={task.id}
        className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/50 rounded-md"
      >
        <div className="flex items-center gap-3">
          {isIncomplete ? (
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          )}
          <div>
            <div className="font-medium">{task.title}</div>
            <div className="flex items-center gap-2 mt-1">
              {/* <Badge variant="outline" className="text-xs">
                {getQuadrantLabel(task.quadrant)}
              </Badge> */}
              {task.roleId && (
                <Badge variant="secondary" className="text-xs">
                  {getRoleName(task.roleId)}
                </Badge>
              )}
              {task.timeSpent > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m
                </span>
              )}
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">Due: {format(new Date(task.dueDate), "MMM d")}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {task.updatedAt ? format(new Date(task.updatedAt), "MMM d") : ""}
          </span>
          {onReopenTask && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleReopenTask(task.id)}>
              {isIncomplete ? "Complete" : "Reopen"}
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Task History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="today" className="text-sm">
              Today
              {todayTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {todayTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="week" className="text-sm">
              This Week
              {thisWeekTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {thisWeekTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="month" className="text-sm">
              This Month
              {thisMonthTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {thisMonthTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="incomplete" className="text-sm">
              Overdue
              {incompleteTasks.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {incompleteTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => renderTaskItem(task))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No tasks completed today</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="week">
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {thisWeekTasks.length > 0 ? (
                thisWeekTasks.map((task) => renderTaskItem(task))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No tasks completed this week</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="month">
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {thisMonthTasks.length > 0 ? (
                thisMonthTasks.map((task) => renderTaskItem(task))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No tasks completed this month</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="incomplete">
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {incompleteTasks.length > 0 ? (
                incompleteTasks.map((task) => renderTaskItem(task, true))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No overdue tasks</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

