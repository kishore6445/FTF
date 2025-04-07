"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import { useTasks } from "@/contexts/tasks-context"

interface AddRitualDialogNewProps {
  onClose: () => void
}

export default function AddRitualDialogNew({ onClose }: AddRitualDialogNewProps) {
  const { toast } = useToast()
  const { addTask } = useTasks()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your ritual",
        variant: "destructive",
      })
      return
    }

    try {
      const newRitual = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        quadrant: 2, // Rituals are Q2 by default
        completed: false,
        timeSpent: 0,
        subtasks: [],
        isRitual: true,
      }

      await addTask(newRitual)

      toast({
        title: "Success",
        description: "Ritual added successfully",
      })

      onClose()
    } catch (error) {
      console.error("Error adding ritual:", error)
      toast({
        title: "Error",
        description: "Failed to add ritual",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-4">Add New Ritual</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Morning Meditation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="10 minutes of mindfulness meditation to start the day"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Ritual</Button>
        </div>
      </form>
    </div>
  )
}

