"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Plus, Calendar, CheckSquare, Target, Clock } from "lucide-react"
import type { Task, Role } from "@/lib/types"

export default function FranklinCoveyPlanner() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [activeTab, setActiveTab] = useState("weekly")
  const [weeklyGoals, setWeeklyGoals] = useState("")
  const [weeklyPriorities, setWeeklyPriorities] = useState<{ id: string; text: string; priority: string }[]>([
    { id: "1", text: "", priority: "A" },
    { id: "2", text: "", priority: "B" },
    { id: "3", text: "", priority: "C" },
  ])

  // Days of the week for daily planning
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0])
  const [dailyTasks, setDailyTasks] = useState<{
    [key: string]: { id: string; text: string; priority: string; completed: boolean }[]
  }>({})

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase.from("roles").select("*").eq("user_id", user?.id)

      if (rolesError) {
        console.error("Error fetching roles:", rolesError)
        toast({
          title: "Error",
          description: "Failed to load roles. Please try again.",
          variant: "destructive",
        })
      } else {
        setRoles(rolesData || [])
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError)
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        })
      } else {
        const transformedTasks = (tasksData || []).map((task) => ({
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

        // Initialize daily tasks for each day
        const initialDailyTasks: {
          [key: string]: { id: string; text: string; priority: string; completed: boolean }[]
        } = {}
        daysOfWeek.forEach((day) => {
          initialDailyTasks[day] = [
            { id: `${day}-1`, text: "", priority: "A", completed: false },
            { id: `${day}-2`, text: "", priority: "B", completed: false },
            { id: `${day}-3`, text: "", priority: "C", completed: false },
          ]
        })
        setDailyTasks(initialDailyTasks)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addWeeklyPriority = () => {
    const newId = (weeklyPriorities.length + 1).toString()
    setWeeklyPriorities([...weeklyPriorities, { id: newId, text: "", priority: "C" }])
  }

  const updateWeeklyPriority = (id: string, field: "text" | "priority", value: string) => {
    setWeeklyPriorities((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addDailyTask = (day: string) => {
    const newId = `${day}-${dailyTasks[day].length + 1}`
    setDailyTasks((prev) => ({
      ...prev,
      [day]: [...prev[day], { id: newId, text: "", priority: "C", completed: false }],
    }))
  }

  const updateDailyTask = (day: string, id: string, field: "text" | "priority" | "completed", value: any) => {
    setDailyTasks((prev) => ({
      ...prev,
      [day]: prev[day].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  // Add this function to your existing franklin-covey-planner.tsx file
  // This would go inside the saveToTasks function
  const mapFranklinPriorityToQuadrant = (priority: string) => {
    switch (priority) {
      case "A":
        return "q1" // Urgent & Important
      case "B":
        return "q2" // Not Urgent & Important
      case "C":
        return "q3" // Urgent & Not Important
      default:
        return "q4" // Not Urgent & Not Important
    }
  }

  const saveToTasks = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Convert weekly priorities to tasks
      const weeklyPriorityTasks = weeklyPriorities
        .filter((p) => p.text.trim() !== "")
        .map((priority) => ({
          title: priority.text,
          description: `Weekly Priority (${priority.priority})`,
          quadrant: mapFranklinPriorityToQuadrant(priority.priority), // Use the mapping function
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

      // Convert daily tasks to tasks
      const dailyTasksToAdd = Object.entries(dailyTasks).flatMap(([day, tasks]) =>
        tasks
          .filter((t) => t.text.trim() !== "")
          .map((task) => ({
            title: task.text,
            description: `${day} Task (${task.priority})`,
            quadrant: mapFranklinPriorityToQuadrant(task.priority), // Use the mapping function
            completed: task.completed,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Mark A-priority tasks as big rocks
            is_big_rock: task.priority === "A",
          })),
      )

      // Combine all tasks
      const allTasksToAdd = [...weeklyPriorityTasks, ...dailyTasksToAdd]

      if (allTasksToAdd.length > 0) {
        const { error } = await supabase.from("tasks").insert(allTasksToAdd)

        if (error) {
          console.error("Error saving tasks:", error)
          toast({
            title: "Error",
            description: "Failed to save tasks. Please try again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: `${allTasksToAdd.length} tasks saved to your quadrants.`,
          })

          // Refresh tasks
          fetchData()
        }
      } else {
        toast({
          title: "No tasks to save",
          description: "Please add some tasks before saving.",
        })
      }
    } catch (error) {
      console.error("Error saving to tasks:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Franklin Covey Planner...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Franklin Covey Planner</h1>
        </div>
        <Button onClick={saveToTasks}>
          <CheckSquare className="h-4 w-4 mr-2" />
          Save to Tasks
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="weekly" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="weekly" className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            <span>Weekly Compass</span>
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Daily Planning</span>
          </TabsTrigger>
        </TabsList>

        {/* Weekly Compass */}
        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goals & Roles</CardTitle>
              <CardDescription>Define your key goals for the week based on your roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weekly-goals">Weekly Goals</Label>
                  <Textarea
                    id="weekly-goals"
                    placeholder="What are your key goals for this week?"
                    value={weeklyGoals}
                    onChange={(e) => setWeeklyGoals(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Weekly Priorities (A/B/C)</Label>
                    <Button variant="outline" size="sm" onClick={addWeeklyPriority}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Priority
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {weeklyPriorities.map((priority) => (
                      <div key={priority.id} className="flex items-center gap-2">
                        <Select
                          value={priority.priority}
                          onValueChange={(value) => updateWeeklyPriority(priority.id, "priority", value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={priority.text}
                          onChange={(e) => updateWeeklyPriority(priority.id, "text", e.target.value)}
                          placeholder="Enter priority task"
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Roles & Responsibilities</CardTitle>
              <CardDescription>Your current roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <Badge key={role.id} style={{ backgroundColor: role.color || "#888" }}>
                      {role.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No roles defined yet. Add roles in the Roles section.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Planning */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Task Planning</CardTitle>
              <CardDescription>Plan your day with A/B/C prioritization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Daily Tasks</Label>
                    <Button variant="outline" size="sm" onClick={() => addDailyTask(selectedDay)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {dailyTasks[selectedDay]?.map((task) => (
                      <div key={task.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            updateDailyTask(selectedDay, task.id, "completed", checked === true)
                          }
                        />
                        <Select
                          value={task.priority}
                          onValueChange={(value) => updateDailyTask(selectedDay, task.id, "priority", value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={task.text}
                          onChange={(e) => updateDailyTask(selectedDay, task.id, "text", e.target.value)}
                          placeholder="Enter task"
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Blocking</CardTitle>
              <CardDescription>Block time for your most important activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { time: "Morning", icon: <Clock className="h-4 w-4" /> },
                  { time: "Afternoon", icon: <Clock className="h-4 w-4" /> },
                  { time: "Evening", icon: <Clock className="h-4 w-4" /> },
                ].map((block) => (
                  <Card key={block.time} className="border shadow-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-1.5">
                        {block.icon}
                        {block.time}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <Textarea placeholder={`${block.time} activities...`} className="min-h-[80px]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

