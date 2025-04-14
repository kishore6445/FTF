"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, Role, Subtask } from "@/lib/types"
import SubtaskManager from "@/components/subtask-manager"

interface EditTaskDialogProps {
  task: Task | null
  roles: Role[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task) => void
}

export default function EditTaskDialog({ task, roles, open, onOpenChange, onSave }: EditTaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (task) {
      setEditedTask(task)
      setSubtasks(task.subtasks || [])
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
    }
  }, [task])

  const handleSave = () => {
    if (!editedTask) return

    onSave({
      ...editedTask,
      subtasks,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
    })

    onOpenChange(false)
  }

  if (!editedTask) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editedTask.description || ""}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quadrant">Quadrant</Label>
              <Select
                value={editedTask.quadrant}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, quadrant: value as "q1" | "q2" | "q3" | "q4" })
                }
              >
                <SelectTrigger id="edit-quadrant">
                  <SelectValue placeholder="Select quadrant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1">Q1: Urgent & Important</SelectItem>
                  <SelectItem value="q2">Q2: Not Urgent & Important</SelectItem>
                  <SelectItem value="q3">Q3: Urgent & Not Important</SelectItem>
                  <SelectItem value="q4">Q4: Not Urgent & Not Important</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editedTask.roleId || "default"}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, roleId: value === "default" ? undefined : value })
                }
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">No Role</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={editedTask.priority || "default"}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, priority: value === "default" ? undefined : value })
                }
              >
                <SelectTrigger id="edit-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">No Priority</SelectItem>
                  <SelectItem value="A1">A1 (Highest)</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="B3">B3</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                  <SelectItem value="C3">C3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-due-date">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="edit-due-date"
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>No due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Subtasks</Label>
            <SubtaskManager
              subtasks={subtasks}
              onChange={setSubtasks}
              taskId={editedTask.id}
              userId={editedTask.userId}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

