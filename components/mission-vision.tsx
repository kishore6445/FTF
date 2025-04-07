"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { Loader2, Plus, Edit, Trash2, MoreVertical, CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface MissionItem {
  id: string
  title: string
  completed: boolean
  priority: number
  type: string
  userId: string
  createdAt?: string
  updatedAt?: string
  ritualType?: string
  startTime?: string
  endTime?: string
  task_id?: string
}

interface MissionVisionProps {
  userId?: string
}

export default function MissionVision({ userId }: MissionVisionProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [missionItems, setMissionItems] = useState<MissionItem[]>([])
  const [activeTab, setActiveTab] = useState("morning-ritual")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MissionItem | null>(null)
  const [newItem, setNewItem] = useState({
    title: "",
    type: "morning-ritual",
    priority: 1,
    ritualType: "daily",
    startTime: "08:00",
    endTime: "08:30",
    createTask: true,
    quadrant: "q2",
  })
  const [editForm, setEditForm] = useState({
    title: "",
    priority: 1,
    ritualType: "daily",
    startTime: "08:00",
    endTime: "08:30",
    quadrant: "q2",
  })

  useEffect(() => {
    if (userId) {
      fetchMissionItems()
    }
  }, [userId])

  const fetchMissionItems = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("mission_items")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: true })

      if (error) throw error

      // Transform data to match our interface
      const transformedItems = data.map((item) => ({
        id: item.id,
        title: item.title,
        completed: item.completed,
        priority: item.priority,
        type: item.type,
        userId: item.user_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        ritualType: item.ritual_type,
        startTime: item.start_time,
        endTime: item.end_time,
        task_id: item.task_id,
      }))

      setMissionItems(transformedItems)
    } catch (error) {
      console.error("Error fetching mission items:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load mission items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!userId) return
    if (!newItem.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your item",
        variant: "destructive",
      })
      return
    }

    try {
      const itemId = uuidv4()
      let taskId = null

      // Create a task if the option is selected
      if (newItem.createTask) {
        taskId = uuidv4()
        const taskData = {
          id: taskId,
          title: newItem.title,
          description: `${
            newItem.type === "morning-ritual"
              ? "Morning Ritual"
              : newItem.type === "eulogy"
                ? "Eulogy Item"
                : "Daily Ritual"
          }: ${newItem.title}`,
          quadrant: newItem.quadrant,
          completed: false,
          time_spent: 0,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_ritual: newItem.type === "morning-ritual" || newItem.type === "daily-ritual",
        }

        const { error: taskError } = await supabase.from("tasks").insert(taskData)

        if (taskError) {
          console.error("Error creating task for mission item:", taskError)
          // Continue with mission item creation even if task creation fails
        }
      }

      const newMissionItem = {
        id: itemId,
        title: newItem.title,
        completed: false,
        priority: newItem.priority,
        type: newItem.type,
        user_id: userId,
        ritual_type: newItem.type === "morning-ritual" || newItem.type === "daily-ritual" ? newItem.ritualType : null,
        start_time: newItem.type === "morning-ritual" ? newItem.startTime : null,
        end_time: newItem.type === "morning-ritual" ? newItem.endTime : null,
        task_id: taskId,
      }

      const { error } = await supabase.from("mission_items").insert(newMissionItem)

      if (error) throw error

      // Add to local state
      setMissionItems((prev) => [
        ...prev,
        {
          id: itemId,
          title: newItem.title,
          completed: false,
          priority: newItem.priority,
          type: newItem.type,
          userId: userId,
          ritualType:
            newItem.type === "morning-ritual" || newItem.type === "daily-ritual" ? newItem.ritualType : undefined,
          startTime: newItem.type === "morning-ritual" ? newItem.startTime : undefined,
          endTime: newItem.type === "morning-ritual" ? newItem.endTime : undefined,
          task_id: taskId,
        },
      ])

      // Reset form
      setNewItem({
        title: "",
        type: activeTab,
        priority: 1,
        ritualType: "daily",
        startTime: "08:00",
        endTime: "08:30",
        createTask: true,
        quadrant: "q2",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Success",
        description: "Item added successfully",
      })
    } catch (error) {
      console.error("Error adding mission item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item",
        variant: "destructive",
      })
    }
  }

  const handleEditItem = async () => {
    if (!userId || !editingItem) return
    if (!editForm.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your item",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedItem = {
        title: editForm.title,
        priority: editForm.priority,
        ritual_type:
          editingItem.type === "morning-ritual" || editingItem.type === "daily-ritual" ? editForm.ritualType : null,
        start_time: editingItem.type === "morning-ritual" ? editForm.startTime : null,
        end_time: editingItem.type === "morning-ritual" ? editForm.endTime : null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("mission_items").update(updatedItem).eq("id", editingItem.id)

      if (error) throw error

      // If there's an associated task, update it too
      if (editingItem.task_id) {
        const taskUpdate = {
          title: editForm.title,
          quadrant: editForm.quadrant,
          updated_at: new Date().toISOString(),
        }

        const { error: taskError } = await supabase.from("tasks").update(taskUpdate).eq("id", editingItem.task_id)

        if (taskError) {
          console.error("Error updating task for mission item:", taskError)
          // Continue even if task update fails
        }
      }

      // Update local state
      setMissionItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: editForm.title,
                priority: editForm.priority,
                ritualType:
                  editingItem.type === "morning-ritual" || editingItem.type === "daily-ritual"
                    ? editForm.ritualType
                    : item.ritualType,
                startTime: editingItem.type === "morning-ritual" ? editForm.startTime : item.startTime,
                endTime: editingItem.type === "morning-ritual" ? editForm.endTime : item.endTime,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )

      setIsEditDialogOpen(false)
      setEditingItem(null)

      toast({
        title: "Success",
        description: "Item updated successfully",
      })
    } catch (error) {
      console.error("Error updating mission item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!userId) return

    try {
      // Find the item to get its task_id if it exists
      const itemToDelete = missionItems.find((item) => item.id === itemId)

      // Delete the mission item
      const { error } = await supabase.from("mission_items").delete().eq("id", itemId)

      if (error) throw error

      // If there's an associated task, delete it too
      if (itemToDelete?.task_id) {
        const { error: taskError } = await supabase.from("tasks").delete().eq("id", itemToDelete.task_id)

        if (taskError) {
          console.error("Error deleting task for mission item:", taskError)
          // Continue even if task deletion fails
        }
      }

      // Update local state
      setMissionItems((prev) => prev.filter((item) => item.id !== itemId))

      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting mission item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const handleToggleComplete = async (itemId: string) => {
    if (!userId) return

    try {
      // Find the item to toggle
      const itemToToggle = missionItems.find((item) => item.id === itemId)
      if (!itemToToggle) return

      const newCompletedState = !itemToToggle.completed

      // Update the mission item
      const { error } = await supabase
        .from("mission_items")
        .update({
          completed: newCompletedState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)

      if (error) throw error

      // If there's an associated task, update it too
      if (itemToToggle.task_id) {
        const { error: taskError } = await supabase
          .from("tasks")
          .update({
            completed: newCompletedState,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemToToggle.task_id)

        if (taskError) {
          console.error("Error updating task completion for mission item:", taskError)
          // Continue even if task update fails
        }
      }

      // Update local state
      setMissionItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                completed: newCompletedState,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )

      toast({
        title: newCompletedState ? "Completed" : "Reopened",
        description: `Item ${newCompletedState ? "marked as complete" : "reopened"}!`,
      })
    } catch (error) {
      console.error("Error toggling mission item completion:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (item: MissionItem) => {
    setEditingItem(item)
    setEditForm({
      title: item.title,
      priority: item.priority,
      ritualType: item.ritualType || "daily",
      startTime: item.startTime || "08:00",
      endTime: item.endTime || "08:30",
      quadrant: "q2", // Default, will be updated if task exists
    })

    // If there's an associated task, get its quadrant
    if (item.task_id) {
      supabase
        .from("tasks")
        .select("quadrant")
        .eq("id", item.task_id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setEditForm((prev) => ({ ...prev, quadrant: data.quadrant }))
          }
        })
    }

    setIsEditDialogOpen(true)
  }

  const filteredItems = missionItems.filter((item) => item.type === activeTab)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="morning-ritual">Morning Ritual</TabsTrigger>
          <TabsTrigger value="eulogy">Eulogy</TabsTrigger>
          <TabsTrigger value="daily-ritual">Daily Rituals</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {activeTab === "morning-ritual"
                ? "Morning Ritual"
                : activeTab === "eulogy"
                  ? "Eulogy Items"
                  : "Daily Rituals"}
            </h3>
            <Button
              size="sm"
              onClick={() => {
                setNewItem({
                  ...newItem,
                  type: activeTab,
                })
                setIsAddDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items yet.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setNewItem({
                    ...newItem,
                    type: activeTab,
                  })
                  setIsAddDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-md p-3 ${item.completed ? "bg-muted/50 border-muted" : "bg-card"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className="mt-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        {item.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <div>
                        <h4 className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                          {item.title}
                        </h4>
                        {(item.type === "morning-ritual" || item.type === "daily-ritual") && item.ritualType && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.ritualType === "daily"
                              ? "Every day"
                              : item.ritualType === "workdays"
                                ? "Workdays"
                                : "Weekly"}
                          </Badge>
                        )}
                        {item.type === "morning-ritual" && item.startTime && item.endTime && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.startTime} - {item.endTime}
                          </div>
                        )}
                        {item.task_id && (
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
                        <DropdownMenuItem onClick={() => handleEditClick(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteItem(item.id)}
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
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New{" "}
              {newItem.type === "morning-ritual"
                ? "Morning Ritual"
                : newItem.type === "eulogy"
                  ? "Eulogy Item"
                  : "Daily Ritual"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>

            {(newItem.type === "morning-ritual" || newItem.type === "daily-ritual") && (
              <div className="space-y-2">
                <Label htmlFor="ritualType">Frequency</Label>
                <Select
                  value={newItem.ritualType}
                  onValueChange={(value) => setNewItem({ ...newItem, ritualType: value })}
                >
                  <SelectTrigger id="ritualType">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Every day</SelectItem>
                    <SelectItem value="workdays">Workdays (Mon-Fri)</SelectItem>
                    <SelectItem value="weekly">Specific days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {newItem.type === "morning-ritual" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newItem.startTime}
                    onChange={(e) => setNewItem({ ...newItem, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newItem.endTime}
                    onChange={(e) => setNewItem({ ...newItem, endTime: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newItem.priority.toString()}
                onValueChange={(value) => setNewItem({ ...newItem, priority: Number.parseInt(value) })}
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
                <Switch
                  id="create-task"
                  checked={newItem.createTask}
                  onCheckedChange={(checked) => setNewItem({ ...newItem, createTask: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will create a task in your quadrants based on this item
              </p>
            </div>

            {newItem.createTask && (
              <div className="space-y-2">
                <Label htmlFor="quadrant">Quadrant</Label>
                <Select value={newItem.quadrant} onValueChange={(value) => setNewItem({ ...newItem, quadrant: value })}>
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
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit{" "}
              {editingItem?.type === "morning-ritual"
                ? "Morning Ritual"
                : editingItem?.type === "eulogy"
                  ? "Eulogy Item"
                  : "Daily Ritual"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>

            {(editingItem?.type === "morning-ritual" || editingItem?.type === "daily-ritual") && (
              <div className="space-y-2">
                <Label htmlFor="edit-ritualType">Frequency</Label>
                <Select
                  value={editForm.ritualType}
                  onValueChange={(value) => setEditForm({ ...editForm, ritualType: value })}
                >
                  <SelectTrigger id="edit-ritualType">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Every day</SelectItem>
                    <SelectItem value="workdays">Workdays (Mon-Fri)</SelectItem>
                    <SelectItem value="weekly">Specific days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingItem?.type === "morning-ritual" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-startTime">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endTime">End Time</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  />
                </div>
              </>
            )}

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

            {editingItem?.task_id && (
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
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

