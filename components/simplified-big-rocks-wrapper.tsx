"use client"

import { useState, useEffect } from "react"
import SimplifiedBigRocks from "@/components/simplified-big-rocks"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Task, Role } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SimplifiedBigRocksWrapper() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase.from("roles").select("*")

        if (rolesError) throw rolesError

        // Fetch big rock tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*, subtasks(*)")
          .eq("is_big_rock", true)

        if (tasksError) throw tasksError

        setRoles(rolesData || [])
        setTasks(tasksData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading your big rocks.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  const handleAddBigRock = () => {
    // Implementation for adding a big rock
    console.log("Add big rock clicked")
    // You can implement a modal or redirect to add task page
  }

  const handleEditTask = (task: Task) => {
    // Implementation for editing a task
    console.log("Edit task:", task)
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      setTasks(tasks.filter((task) => task.id !== taskId))
      toast({
        title: "Task deleted",
        description: "The big rock has been removed.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error deleting task",
        description: "There was a problem deleting the big rock.",
        variant: "destructive",
      })
    }
  }

  const handleToggleTaskCompletion = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const newCompletedState = !task.completed

      const { error } = await supabase.from("tasks").update({ completed: newCompletedState }).eq("id", taskId)

      if (error) throw error

      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: newCompletedState } : t)))

      toast({
        title: newCompletedState ? "Task completed" : "Task reopened",
        description: newCompletedState
          ? "The big rock has been marked as complete."
          : "The big rock has been reopened.",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error updating task",
        description: "There was a problem updating the big rock status.",
        variant: "destructive",
      })
    }
  }

  const handleToggleSubtaskCompletion = async (taskId: string, subtaskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task || !task.subtasks) return

      const subtask = task.subtasks.find((s) => s.id === subtaskId)
      if (!subtask) return

      const newCompletedState = !subtask.completed

      const { error } = await supabase.from("subtasks").update({ completed: newCompletedState }).eq("id", subtaskId)

      if (error) throw error

      setTasks(
        tasks.map((t) => {
          if (t.id === taskId && t.subtasks) {
            return {
              ...t,
              subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: newCompletedState } : s)),
            }
          }
          return t
        }),
      )
    } catch (error) {
      console.error("Error updating subtask:", error)
      toast({
        title: "Error updating subtask",
        description: "There was a problem updating the subtask status.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SimplifiedBigRocks
      tasks={tasks}
      roles={roles}
      onAddBigRock={handleAddBigRock}
      onEditTask={handleEditTask}
      onDeleteTask={handleDeleteTask}
      onToggleTaskCompletion={handleToggleTaskCompletion}
      onToggleSubtaskCompletion={handleToggleSubtaskCompletion}
    />
  )
}

