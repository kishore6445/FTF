"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTasks } from "@/contexts/tasks-context"
import { getTasks } from "@/lib/data"

export default function AddSampleTasks() {
  const [loading, setLoading] = useState(false)
  const { addTask, refreshTasks } = useTasks()
  const { toast } = useToast()

  const handleAddSampleTasks = async () => {
    setLoading(true)
    try {
      const sampleTasks = await getTasks()

      // Add each sample task
      for (const task of sampleTasks) {
        await addTask({
          title: task.title,
          description: task.description,
          quadrant: task.quadrant,
          roleId: task.roleId,
          priority: task.priority,
        })
      }

      toast({
        title: "Sample tasks added",
        description: "Sample tasks have been added to your quadrants",
      })

      // Refresh tasks to show the new ones
      await refreshTasks()
    } catch (error) {
      console.error("Error adding sample tasks:", error)
      toast({
        title: "Error",
        description: "Failed to add sample tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleAddSampleTasks} disabled={loading} variant="outline">
      {loading ? "Adding..." : "Add Sample Tasks"}
    </Button>
  )
}

