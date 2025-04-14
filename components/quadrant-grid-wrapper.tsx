"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import { Loader2 } from "lucide-react"
import QuadrantGrid from "@/components/quadrant-grid"
import AddTaskDialog from "@/components/add-task-dialog"
import { useTasks } from "@/contexts/tasks-context"
import { useRoles } from "@/contexts/roles-context"

export default function QuadrantGridWrapper() {
  const { tasks, loading, moveTask, toggleTaskCompletion, deleteTask, updateTask, updateTimeSpent } = useTasks()
  const { roles } = useRoles()
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null)

  const handleAddTask = (quadrant: string) => {
    setSelectedQuadrant(quadrant)
    setIsAddTaskOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Four Quadrants</h1>
      <p className="text-muted-foreground">
        Organize your tasks based on urgency and importance to focus on what matters most.
      </p>

      <QuadrantGrid
        tasks={tasks}
        roles={roles}
        moveTask={moveTask}
        toggleTaskCompletion={toggleTaskCompletion}
        deleteTask={deleteTask}
        updateTask={updateTask}
        onUpdateTimeSpent={updateTimeSpent}
        onAddTask={handleAddTask}
      />

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} defaultQuadrant={selectedQuadrant} />
    </div>
  )
}

