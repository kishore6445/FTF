"use client"

import { useState } from "react"
import { format, isToday, isThisWeek, addDays } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, X, Calendar, CalendarDays } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"
import type { Task, Role } from "@/lib/types"

interface PlannerTasksSidebarProps {
  tasks: Task[]
  roles: Role[]
  onMoveToQuadrant: (taskId: string, quadrant: string) => void
  onTaskAdded?: () => Promise<void>
}

export default function PlannerTasksSidebar({
  tasks = [],
  roles = [],
  onMoveToQuadrant,
  onTaskAdded,
}: PlannerTasksSidebarProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("daily")

  // States for adding new tasks
  const [newDailyTask, setNewDailyTask] = useState("")
  const [newWeeklyTask, setNewWeeklyTask] = useState("")
  const [showDailyInput, setShowDailyInput] = useState(false)
  const [showWeeklyInput, setShowWeeklyInput] = useState(false)
  const [savingDailyTask, setSavingDailyTask] = useState(false)
  const [savingWeeklyTask, setSavingWeeklyTask] = useState(false)

  // Filter tasks for today
  const todayTasks = tasks.filter((task) => !task.completed && task.dueDate && isToday(new Date(task.dueDate)))

  // Filter tasks for this week (excluding today)
  const weekTasks = tasks.filter(
    (task) => !task.completed && task.dueDate && isThisWeek(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)),
  )

  // Get role name by ID
  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.name : "No Role"
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEE, MMM d")
    } catch (error) {
      return "Invalid date"
    }
  }

  // Handle adding a new task for today
  const handleAddDailyTask = async () => {
    if (!newDailyTask.trim()) return

    setSavingDailyTask(true)
    try {
      const today = new Date()
      const taskId = uuidv4()

      const newTask = {
        id: taskId,
        title: newDailyTask,
        description: "",
        quadrant: "q2", // Default to Important but Not Urgent
        role_id: null,
        completed: false,
        time_spent: 0,
        user_id: tasks[0]?.userId || "", // Get user ID from existing tasks
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: format(today, "yyyy-MM-dd"),
        recurrence_id: null,
        is_ritual: false,
      }

      const { error } = await supabase.from("tasks").insert(newTask)

      if (error) throw error

      toast({
        title: "Task added",
        description: "Task added to your daily plan",
      })

      // Reset input
      setNewDailyTask("")
      setShowDailyInput(false)

      // Refresh tasks
      if (onTaskAdded) await onTaskAdded()
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      })
    } finally {
      setSavingDailyTask(false)
    }
  }

  // Handle adding a new task for this week
  const handleAddWeeklyTask = async () => {
    if (!newWeeklyTask.trim()) return

    setSavingWeeklyTask(true)
    try {
      const tomorrow = addDays(new Date(), 1)
      const taskId = uuidv4()

      const newTask = {
        id: taskId,
        title: newWeeklyTask,
        description: "",
        quadrant: "q2", // Default to Important but Not Urgent
        role_id: null,
        completed: false,
        time_spent: 0,
        user_id: tasks[0]?.userId || "", // Get user ID from existing tasks
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: format(tomorrow, "yyyy-MM-dd"),
        recurrence_id: null,
        is_ritual: false,
      }

      const { error } = await supabase.from("tasks").insert(newTask)

      if (error) throw error

      toast({
        title: "Task added",
        description: "Task added to your weekly plan",
      })

      // Reset input
      setNewWeeklyTask("")
      setShowWeeklyInput(false)

      // Refresh tasks
      if (onTaskAdded) await onTaskAdded()
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      })
    } finally {
      setSavingWeeklyTask(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Planner Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="daily" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Daily Plan</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>Weekly Plan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            {todayTasks.length === 0 && !showDailyInput ? (
              <div className="text-center py-4 text-muted-foreground">No tasks scheduled for today</div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div key={task.id} className="border rounded-md p-3 bg-card">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        {task.roleId && (
                          <Badge variant="outline" className="mt-1">
                            {getRoleName(task.roleId)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMoveToQuadrant(task.id, "q1")}
                          title="Move to Q1: Important & Urgent"
                        >
                          Q1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMoveToQuadrant(task.id, "q2")}
                          title="Move to Q2: Important & Not Urgent"
                        >
                          Q2
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showDailyInput ? (
              <div className="border rounded-md p-3 bg-card">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter task for today..."
                    value={newDailyTask}
                    onChange={(e) => setNewDailyTask(e.target.value)}
                    autoFocus
                    disabled={savingDailyTask}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddDailyTask()
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDailyInput(false)}
                      disabled={savingDailyTask}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleAddDailyTask} disabled={!newDailyTask.trim() || savingDailyTask}>
                      {savingDailyTask ? (
                        <span className="animate-pulse">Saving...</span>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button className="w-full" variant="outline" onClick={() => setShowDailyInput(true)}>
                Add Task for Today
              </Button>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {weekTasks.length === 0 && !showWeeklyInput ? (
              <div className="text-center py-4 text-muted-foreground">No tasks scheduled for this week</div>
            ) : (
              <div className="space-y-2">
                {weekTasks.map((task) => (
                  <div key={task.id} className="border rounded-md p-3 bg-card">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {task.roleId && <Badge variant="outline">{getRoleName(task.roleId)}</Badge>}
                          <span className="text-xs text-muted-foreground">
                            {task.dueDate && formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMoveToQuadrant(task.id, "q1")}
                          title="Move to Q1: Important & Urgent"
                        >
                          Q1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMoveToQuadrant(task.id, "q2")}
                          title="Move to Q2: Important & Not Urgent"
                        >
                          Q2
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showWeeklyInput ? (
              <div className="border rounded-md p-3 bg-card">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter task for this week..."
                    value={newWeeklyTask}
                    onChange={(e) => setNewWeeklyTask(e.target.value)}
                    autoFocus
                    disabled={savingWeeklyTask}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddWeeklyTask()
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowWeeklyInput(false)}
                      disabled={savingWeeklyTask}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddWeeklyTask}
                      disabled={!newWeeklyTask.trim() || savingWeeklyTask}
                    >
                      {savingWeeklyTask ? (
                        <span className="animate-pulse">Saving...</span>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button className="w-full" variant="outline" onClick={() => setShowWeeklyInput(true)}>
                Add Task for This Week
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

