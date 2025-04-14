"use client"
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import MissionVision from "@/components/mission-vision"
import { Loader2, Plus, Calendar } from "lucide-react"

export default function MissionVisionClient() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskDueDate, setNewTaskDueDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [newTaskQuadrant, setNewTaskQuadrant] = useState("q2")
  const [activeTab, setActiveTab] = useState("mission")

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch tasks
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (taskError) throw taskError

        // Transform task data
        const transformedTasks = (taskData || []).map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          quadrant: task.quadrant,
          roleId: task.role_id || "",
          completed: task.completed,
          timeSpent: task.time_spent || 0,
          subtasks: [],
          userId: task.user_id,
          dueDate: task.due_date,
          isRitual: task.is_ritual || false,
        }))

        setTasks(transformedTasks)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  const handleAddTask = async () => {
    if (!user) return
    if (!newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      })
      return
    }

    try {
      const taskId = uuidv4()
      const newTask = {
        id: taskId,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        quadrant: newTaskQuadrant,
        role_id: null,
        completed: false,
        time_spent: 0,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: newTaskDueDate,
        recurrence_id: null,
        is_ritual: false,
      }

      const { error } = await supabase.from("tasks").insert(newTask)

      if (error) throw error

      // Add to local state
      setTasks([
        {
          ...newTask,
          roleId: null,
          userId: user.id,
          subtasks: [],
        },
        ...tasks,
      ])

      // Reset form
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskDueDate(format(new Date(), "yyyy-MM-dd"))
      setNewTaskQuadrant("q2")
      setIsAddTaskDialogOpen(false)

      toast({
        title: "Success",
        description: "Task added successfully",
      })
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error ? String(error.message) : "Failed to add task",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mission & Vision</h1>
        <Button onClick={() => setIsAddTaskDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="eulogy">Eulogy</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="mission" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Mission Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Your personal mission statement defines who you are, what you stand for, and what you want to achieve
                  in life.
                </p>
                <Textarea
                  placeholder="Write your personal mission statement here... What is your purpose? What values guide your decisions? What do you want to accomplish?"
                  className="min-h-[150px]"
                />
                <Button className="w-full">Save Mission Statement</Button>
              </div>
              <div className="mt-6">
                <MissionVision userId={user?.id} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eulogy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Eulogy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Write your own eulogy as if you've lived your ideal life. What would you want people to say about you?
              </p>
              <Textarea
                placeholder="Write your eulogy here... What legacy do you want to leave? How do you want to be remembered?"
                className="min-h-[150px]"
              />
              <Button className="w-full mt-4">Save Eulogy</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mission & Vision Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Your Tasks</h3>
                  <Button size="sm" onClick={() => setIsAddTaskDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks yet. Add tasks to help achieve your mission and vision.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="border rounded-md p-3 bg-card">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                            {task.dueDate && (
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(new Date(task.dueDate), "MMM d, yyyy")}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                task.quadrant === "q1"
                                  ? "bg-red-100 text-red-800"
                                  : task.quadrant === "q2"
                                    ? "bg-blue-100 text-blue-800"
                                    : task.quadrant === "q3"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                              }`}
                            >
                              {task.quadrant.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quadrant">Quadrant</Label>
              <select
                id="quadrant"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTaskQuadrant}
                onChange={(e) => setNewTaskQuadrant(e.target.value)}
              >
                <option value="q1">Q1: Important & Urgent</option>
                <option value="q2">Q2: Important & Not Urgent</option>
                <option value="q3">Q3: Not Important & Urgent</option>
                <option value="q4">Q4: Not Important & Not Urgent</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

