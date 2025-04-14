"use client"
export const dynamic = "force-dynamic";

import type * as React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react"
import type { Task } from "@/lib/types"

interface TaskPriorityManagerProps {
  tasks: Task[]
  quadrantName: string
  onClose: () => void
  onSave: (tasks: Task[]) => void
}

export default function TaskPriorityManager({ tasks, quadrantName, onClose, onSave }: TaskPriorityManagerProps) {
  const [prioritizedTasks, setPrioritizedTasks] = useState<Task[]>(tasks)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const handlePriorityChange = (taskId: string, priority: string | undefined) => {
    setPrioritizedTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, priority: priority } : task)),
    )
  }

  const handleSave = () => {
    onSave(prioritizedTasks)
    onClose()
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()

    if (!draggedTaskId || draggedTaskId === targetTaskId) return

    const updatedTasks = [...prioritizedTasks]
    const draggedTaskIndex = updatedTasks.findIndex((task) => task.id === draggedTaskId)
    const targetTaskIndex = updatedTasks.findIndex((task) => task.id === targetTaskId)

    const [draggedTask] = updatedTasks.splice(draggedTaskIndex, 1)
    updatedTasks.splice(targetTaskIndex, 0, draggedTask)

    setPrioritizedTasks(updatedTasks)
    setDraggedTaskId(null)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
  }

  const moveTaskUp = (taskId: string) => {
    const taskIndex = prioritizedTasks.findIndex((task) => task.id === taskId)
    if (taskIndex <= 0) return

    const updatedTasks = [...prioritizedTasks]
    const temp = updatedTasks[taskIndex]
    updatedTasks[taskIndex] = updatedTasks[taskIndex - 1]
    updatedTasks[taskIndex - 1] = temp

    setPrioritizedTasks(updatedTasks)
  }

  const moveTaskDown = (taskId: string) => {
    const taskIndex = prioritizedTasks.findIndex((task) => task.id === taskId)
    if (taskIndex >= prioritizedTasks.length - 1) return

    const updatedTasks = [...prioritizedTasks]
    const temp = updatedTasks[taskIndex]
    updatedTasks[taskIndex] = updatedTasks[taskIndex + 1]
    updatedTasks[taskIndex + 1] = temp

    setPrioritizedTasks(updatedTasks)
  }

  const getQuadrantName = (quadrant: string) => {
    switch (quadrant) {
      case "q1":
        return "Urgent & Important"
      case "q2":
        return "Important, Not Urgent"
      case "q3":
        return "Urgent, Not Important"
      case "q4":
        return "Not Urgent, Not Important"
      default:
        return quadrant.toUpperCase()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Task Priorities</DialogTitle>
          <DialogDescription>
            Set priorities and drag to reorder tasks in {getQuadrantName(quadrantName)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 py-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center font-medium text-sm px-2 mb-2">
            <div className="w-8"></div>
            <div>Task</div>
            <div className="w-24 text-center">Priority</div>
          </div>

          {prioritizedTasks.map((task, index) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, task.id)}
              onDragEnd={handleDragEnd}
              className={`grid grid-cols-[auto_1fr_auto] gap-2 items-center p-2 rounded-md ${
                draggedTaskId === task.id ? "opacity-50 bg-muted" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-1">
                <div className="cursor-move">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => moveTaskUp(task.id)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => moveTaskDown(task.id)}
                    disabled={index === prioritizedTasks.length - 1}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Label htmlFor={`task-${task.id}`} className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <span>{task.title}</span>
                  {task.is_big_rock && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                    >
                      Big Rock
                    </Badge>
                  )}
                </div>
                {task.description && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
              </Label>

              <select
                id={`task-${task.id}`}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-24"
                value={task.priority || ""}
                onChange={(e) => handlePriorityChange(task.id, e.target.value)}
              >
                <option value="">No Priority</option>
                <option value="A1">A1 (Highest)</option>
                <option value="A2">A2</option>
                <option value="A3">A3</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="B3">B3</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
                <option value="C3">C3 (Lowest)</option>
              </select>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Priorities</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

