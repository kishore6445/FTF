"use client"
export const dynamic = "force-dynamic";


import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Subtask } from "@/lib/types"

interface SubtaskManagerProps {
  subtasks: Subtask[]
  onChange: (subtasks: Subtask[]) => void
  taskId?: string
  userId?: string
}

export default function SubtaskManager({ subtasks, onChange, taskId = "", userId = "" }: SubtaskManagerProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: uuidv4(),
      taskId: taskId,
      title: newSubtaskTitle.trim(),
      completed: false,
      userId: userId,
    }

    onChange([...subtasks, newSubtask])
    setNewSubtaskTitle("")
  }

  const handleRemoveSubtask = (id: string) => {
    onChange(subtasks.filter((subtask) => subtask.id !== id))
  }

  const handleToggleSubtask = (id: string) => {
    onChange(subtasks.map((subtask) => (subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask)))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSubtask()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a subtask"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddSubtask}
          disabled={!newSubtaskTitle.trim()}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add subtask</span>
        </Button>
      </div>

      {subtasks.length > 0 && (
        <div className="space-y-2 mt-3">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => handleToggleSubtask(subtask.id)}
                className="h-4 w-4"
              />
              <span className={`text-sm flex-1 ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                {subtask.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveSubtask(subtask.id)}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

