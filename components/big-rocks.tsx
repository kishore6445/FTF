"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { format, addDays, addWeeks, addMonths } from "date-fns"
import { Loader2, Plus, Calendar, MoreVertical, Edit, Trash2, CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BigRock {
  id: string
  title: string
  description?: string
  timeframe: string
  priority: number
  completed: boolean
  due_date?: string
  user_id: string
  created_at?: string
  updated_at?: string
  task_id?: string
}

export default function BigRocks() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [bigRocks, setBigRocks] = useState<BigRock[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("weekly")
  const [tableExists, setTableExists] = useState(true)
  const [newRock, setNewRock] = useState({
    title: "",
    description: "",
    timeframe: "weekly",
    priority: 1,
    createTask: true,
    quadrant: "q2",
  })
  const [editingRock, setEditingRock] = useState<BigRock | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    timeframe: "",
    priority: 1,
    quadrant: "q2",
  })

  useEffect(() => {
    if (user) {
      fetchBigRocks()
    }
  }, [user])

  const fetchBigRocks = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("big_rocks")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: true })

      if (error) {
        console.error("Error fetching big rocks:", error)
        // Only set tableExists to false if the error is specifically about the table not existing
        if (error.message.includes("does not exist") || error.message.includes("relation") || error.code === "42P01") {
          setTableExists(false)
        } else {
          toast({
            title: "Error",
            description: "Failed to load big rocks. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        // Table exists and query succeeded
        setTableExists(true)
        setBigRocks(data || [])
      }
    } catch (error) {
      console.error("Error in fetchBigRocks:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBigRock = async () => {
    if (!user) return
    if (!newRock.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your big rock.",
        variant: "destructive",
      })
      return
    }

    try {
      // Calculate due date based on timeframe
      let dueDate = new Date()
      switch (newRock.timeframe) {
        case "daily":
          dueDate = addDays(dueDate, 1)
          break
        case "weekly":
          dueDate = addWeeks(dueDate, 1)
          break
        case "monthly":
          dueDate = addMonths(dueDate, 1)
          break
        case "quarterly":
          dueDate = addMonths(dueDate, 3)
          break
        case "yearly":
          dueDate = addMonths(dueDate, 12)
          break
      }

      const formattedDueDate = format(dueDate, "yyyy-MM-dd")
      const rockId = uuidv4()
      let taskId = null

      // First, create a task if the option is selected
      if (newRock.createTask) {
        taskId = uuidv4()
        const taskData = {
          id: taskId,
          title: newRock.title,
          description: newRock.description,
          quadrant: newRock.quadrant,
          completed: false,
          time_spent: 0,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          due_date: formattedDueDate,
        }

        const { error: taskError } = await supabase.from("tasks").insert(taskData)

        if (taskError) {
          console.error("Error creating task for big rock:", taskError)
          // Continue with big rock creation even if task creation fails
        }
      }

      // Then create the big rock
      const newBigRock = {
        id: rockId,
        title: newRock.title,
        description: newRock.description,
        timeframe: newRock.timeframe,
        priority: newRock.priority,
        completed: false,
        due_date: formattedDueDate,
        user_id: user.id,
        task_id: taskId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("big_rocks").insert(newBigRock)

      if (error) {
        console.error("Error inserting big rock:", error)
        throw error
      }

      // Add to local state
      setBigRocks((prev) => [...prev, newBigRock])

      // Reset form
      setNewRock({
        title: "",
        description: "",
        timeframe: "weekly",
        priority: 1,
        createTask: true,
        quadrant: "q2",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Success",
        description: "Big rock added successfully!",
      })
    } catch (error) {
      console.error("Error adding big rock:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add big rock. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditBigRock = async () => {
    if (!user || !editingRock) return
    if (!editForm.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your big rock.",
        variant: "destructive",
      })
      return
    }

    try {
      // Calculate due date based on timeframe if it changed
      let dueDate = editingRock.due_date ? new Date(editingRock.due_date) : new Date()

      if (editForm.timeframe !== editingRock.timeframe) {
        dueDate = new Date()
        switch (editForm.timeframe) {
          case "daily":
            dueDate = addDays(dueDate, 1)
            break
          case "weekly":
            dueDate = addWeeks(dueDate, 1)
            break
          case "monthly":
            dueDate = addMonths(dueDate, 1)
            break
          case "quarterly":
            dueDate = addMonths(dueDate, 3)
            break
          case "yearly":
            dueDate = addMonths(dueDate, 12)
            break
        }
      }

      const formattedDueDate = format(dueDate, "yyyy-MM-dd")

      // Update the big rock
      const updatedBigRock = {
        title: editForm.title,
        description: editForm.description,
        timeframe: editForm.timeframe,
        priority: editForm.priority,
        due_date: formattedDueDate,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("big_rocks").update(updatedBigRock).eq("id", editingRock.id)

      if (error) throw error

      // If there's an associated task, update it too
      if (editingRock.task_id) {
        const taskUpdate = {
          title: editForm.title,
          description: editForm.description,
          quadrant: editForm.quadrant,
          due_date: formattedDueDate,
          updated_at: new Date().toISOString(),
        }

        const { error: taskError } = await supabase.from("tasks").update(taskUpdate).eq("id", editingRock.task_id)

        if (taskError) {
          console.error("Error updating task for big rock:", taskError)
          // Continue even if task update fails
        }
      }

      // Update local state
      setBigRocks((prev) =>
        prev.map((rock) =>
          rock.id === editingRock.id
            ? {
                ...rock,
                title: editForm.title,
                description: editForm.description,
                timeframe: editForm.timeframe,
                priority: editForm.priority,
                due_date: formattedDueDate,
                updated_at: new Date().toISOString(),
              }
            : rock,
        ),
      )

      setIsEditDialogOpen(false)
      setEditingRock(null)

      toast({
        title: "Success",
        description: "Big rock updated successfully!",
      })
    } catch (error) {
      console.error("Error updating big rock:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update big rock. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBigRock = async (rockId: string) => {
    if (!user) return

    try {
      // Find the rock to get its task_id if it exists
      const rockToDelete = bigRocks.find((rock) => rock.id === rockId)

      // Delete the big rock
      const { error } = await supabase.from("big_rocks").delete().eq("id", rockId)

      if (error) throw error

      // If there's an associated task, delete it too
      if (rockToDelete?.task_id) {
        const { error: taskError } = await supabase.from("tasks").delete().eq("id", rockToDelete.task_id)

        if (taskError) {
          console.error("Error deleting task for big rock:", taskError)
          // Continue even if task deletion fails
        }
      }

      // Update local state
      setBigRocks((prev) => prev.filter((rock) => rock.id !== rockId))

      toast({
        title: "Success",
        description: "Big rock deleted successfully!",
      })
    } catch (error) {
      console.error("Error deleting big rock:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete big rock. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleComplete = async (rockId: string) => {
    if (!user) return

    try {
      // Find the rock to toggle
      const rockToToggle = bigRocks.find((rock) => rock.id === rockId)
      if (!rockToToggle) return

      const newCompletedState = !rockToToggle.completed

      // Update the big rock
      const { error } = await supabase
        .from("big_rocks")
        .update({
          completed: newCompletedState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rockId)

      if (error) throw error

      // If there's an associated task, update it too
      if (rockToToggle.task_id) {
        const { error: taskError } = await supabase
          .from("tasks")
          .update({
            completed: newCompletedState,
            updated_at: new Date().toISOString(),
          })
          .eq("id", rockToToggle.task_id)

        if (taskError) {
          console.error("Error updating task completion for big rock:", taskError)
          // Continue even if task update fails
        }
      }

      // Update local state
      setBigRocks((prev) =>
        prev.map((rock) =>
          rock.id === rockId
            ? {
                ...rock,
                completed: newCompletedState,
                updated_at: new Date().toISOString(),
              }
            : rock,
        ),
      )

      toast({
        title: newCompletedState ? "Completed" : "Reopened",
        description: `Big rock ${newCompletedState ? "marked as complete" : "reopened"}!`,
      })
    } catch (error) {
      console.error("Error toggling big rock completion:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update big rock. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (rock: BigRock) => {
    setEditingRock(rock)
    setEditForm({
      title: rock.title,
      description: rock.description || "",
      timeframe: rock.timeframe,
      priority: rock.priority,
      quadrant: "q2", // Default, will be updated if task exists
    })

    // If there's an associated task, get its quadrant
    if (rock.task_id) {
      supabase
        .from("tasks")
        .select("quadrant")
        .eq("id", rock.task_id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setEditForm((prev) => ({ ...prev, quadrant: data.quadrant }))
          }
        })
    }

    setIsEditDialogOpen(true)
  }

  const filteredRocks = bigRocks.filter((rock) => rock.timeframe === activeTab)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!tableExists) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Big Rocks</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900 mb-4">
              <AlertTitle className="text-amber-800 dark:text-amber-300">Database Setup Required</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                The Big Rocks table doesn't exist in your database yet. Please refresh the page if you've already
                created the table manually.
              </AlertDescription>
            </Alert>

            <Button onClick={() => window.location.reload()} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Big Rocks</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Big Rock
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-md">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{activeTab} Big Rocks</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRocks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {activeTab} big rocks yet.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Big Rock
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRocks.map((rock) => (
                    <div
                      key={rock.id}
                      className={`border rounded-lg p-4 ${rock.completed ? "bg-muted/50 border-muted" : "bg-card"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleComplete(rock.id)}
                            className="mt-1 text-primary hover:text-primary/80 transition-colors"
                          >
                            {rock.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                          </button>
                          <div>
                            <h3
                              className={`font-medium text-lg ${
                                rock.completed ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {rock.title}
                            </h3>
                            {rock.description && <p className="text-muted-foreground mt-1">{rock.description}</p>}
                            {rock.due_date && (
                              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                Due: {format(new Date(rock.due_date), "MMM d, yyyy")}
                              </div>
                            )}
                            {rock.task_id && (
                              <div className="flex items-center mt-1 text-xs text-primary">
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Added to Quadrants
                              </div>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(rock)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteBigRock(rock.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Big Rock Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Big Rock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newRock.title}
                onChange={(e) => setNewRock({ ...newRock, title: e.target.value })}
                placeholder="Enter big rock title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newRock.description}
                onChange={(e) => setNewRock({ ...newRock, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={newRock.timeframe} onValueChange={(value) => setNewRock({ ...newRock, timeframe: value })}>
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newRock.priority.toString()}
                onValueChange={(value) => setNewRock({ ...newRock, priority: Number.parseInt(value) })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Highest</SelectItem>
                  <SelectItem value="2">2 - High</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - Low</SelectItem>
                  <SelectItem value="5">5 - Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="create-task">Add to Quadrants</Label>
                <input
                  type="checkbox"
                  id="create-task"
                  checked={newRock.createTask}
                  onChange={(e) => setNewRock({ ...newRock, createTask: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will create a task in your quadrants based on this big rock
              </p>
            </div>
            {newRock.createTask && (
              <div className="space-y-2">
                <Label htmlFor="quadrant">Quadrant</Label>
                <Select value={newRock.quadrant} onValueChange={(value) => setNewRock({ ...newRock, quadrant: value })}>
                  <SelectTrigger id="quadrant">
                    <SelectValue placeholder="Select quadrant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1">Q1: Important & Urgent</SelectItem>
                    <SelectItem value="q2">Q2: Important & Not Urgent</SelectItem>
                    <SelectItem value="q3">Q3: Not Important & Urgent</SelectItem>
                    <SelectItem value="q4">Q4: Not Important & Not Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBigRock}>Add Big Rock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Big Rock Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Big Rock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter big rock title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-timeframe">Timeframe</Label>
              <Select
                value={editForm.timeframe}
                onValueChange={(value) => setEditForm({ ...editForm, timeframe: value })}
              >
                <SelectTrigger id="edit-timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={editForm.priority.toString()}
                onValueChange={(value) => setEditForm({ ...editForm, priority: Number.parseInt(value) })}
              >
                <SelectTrigger id="edit-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Highest</SelectItem>
                  <SelectItem value="2">2 - High</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - Low</SelectItem>
                  <SelectItem value="5">5 - Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingRock?.task_id && (
              <div className="space-y-2">
                <Label htmlFor="edit-quadrant">Quadrant</Label>
                <Select
                  value={editForm.quadrant}
                  onValueChange={(value) => setEditForm({ ...editForm, quadrant: value })}
                >
                  <SelectTrigger id="edit-quadrant">
                    <SelectValue placeholder="Select quadrant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1">Q1: Important & Urgent</SelectItem>
                    <SelectItem value="q2">Q2: Important & Not Urgent</SelectItem>
                    <SelectItem value="q3">Q3: Not Important & Urgent</SelectItem>
                    <SelectItem value="q4">Q4: Not Important & Not Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBigRock}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

