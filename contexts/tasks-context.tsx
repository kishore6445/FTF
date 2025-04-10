"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import type { Task, Role } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

interface TasksContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  addTask: (task: Partial<Task>) => Promise<void>
  updateTask: (task: Task) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  toggleTaskCompletion: (taskId: string) => Promise<void>
  moveTask: (taskId: string, targetQuadrant: string) => Promise<void>
  updateTimeSpent: (taskId: string, additionalSeconds: number) => Promise<void>
  refreshTasks: () => Promise<void>
}

interface TasksProviderProps {
  children: ReactNode
  initialTasks?: Task[]
  initialRoles?: Role[]
  toggleTaskComplete?: (taskId: string) => Promise<void>
  deleteTask?: (taskId: string) => Promise<void>
  updateTask?: (task: Task) => Promise<void>
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({
  children,
  initialTasks = [],
  initialRoles = [],
  toggleTaskComplete,
  deleteTask: externalDeleteTask,
  updateTask: externalUpdateTask,
}: TasksProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [loading, setLoading] = useState(initialTasks.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [initialTasksSet, setInitialTasksSet] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const client = createServerComponentClient({ cookies })

  useEffect(() => {
    if (user && initialTasks.length === 0 && !initialTasksSet) {
      fetchTasks()
    } else if (!initialTasksSet) {
      setTasks(initialTasks)
      setInitialTasksSet(true)
      setLoading(false)
    }
  }, [user])

  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Try to load cached tasks first as a fallback
      let cachedTasks: Task[] = []
      try {
        const cachedTasksJson = localStorage.getItem("cachedTasks")
        if (cachedTasksJson) {
          cachedTasks = JSON.parse(cachedTasksJson)
          console.log("Loaded cached tasks as fallback")
        }
      } catch (cacheError) {
        console.warn("Error loading cached tasks:", cacheError)
      }

      // Attempt to fetch from Supabase
      const { data, error } = await client
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tasks:", error)

        // If we have cached tasks, use them as a fallback
        if (cachedTasks.length > 0) {
          setTasks(cachedTasks)
          setError("Using cached data. Some information may be outdated.")
          toast({
            title: "Connection issue",
            description: "Using cached data. Some information may be outdated.",
            variant: "warning",
          })
        } else {
          setError("Failed to load tasks. Please check your connection and try again.")
          toast({
            title: "Error fetching tasks",
            description: "There was a problem loading your tasks. Please try again later.",
            variant: "destructive",
          })
        }
        return
      }

      const transformedTasks: Task[] = (data || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        quadrant: task.quadrant,
        roleId: task.role_id,
        completed: task.completed || false,
        timeSpent: task.time_spent || 0,
        subtasks: [],
        userId: task.user_id,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        dueDate: task.due_date,
        recurrenceId: task.recurrence_id,
        isRitual: task.is_ritual || false,
        is_big_rock: task.is_big_rock || false,
        priority: task.priority || "", // Keep this for UI, even if not in DB
      }))

      // Cache the successfully fetched tasks for offline use
      try {
        localStorage.setItem("cachedTasks", JSON.stringify(transformedTasks))
      } catch (cacheError) {
        console.warn("Error caching tasks:", cacheError)
      }

      setTasks(transformedTasks)
      setError(null)
    } catch (error) {
      console.error("Error in fetchTasks:", error)

      // Try to load cached tasks as fallback
      try {
        const cachedTasksJson = localStorage.getItem("cachedTasks")
        if (cachedTasksJson) {
          const cachedTasks = JSON.parse(cachedTasksJson)
          setTasks(cachedTasks)
          setError("Using cached data. Some information may be outdated.")
          toast({
            title: "Connection issue",
            description: "Using cached data. Some information may be outdated.",
            variant: "warning",
          })
        } else {
          setError("Failed to load tasks. Please check your connection and try again.")
          toast({
            title: "Error fetching tasks",
            description: "There was a problem loading your tasks. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (cacheError) {
        console.warn("Error loading cached tasks:", cacheError)
        setError("Failed to load tasks. Please check your connection and try again.")
        toast({
          title: "Error fetching tasks",
          description: "There was a problem loading your tasks. Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (taskData: Partial<Task>) => {
    if (!user) return

    try {
      const taskId = taskData.id || uuidv4()
      const now = new Date().toISOString()

      const newTask = {
        id: taskId,
        title: taskData.title || "New Task",
        description: taskData.description || "",
        quadrant: taskData.quadrant || "q2",
        role_id: taskData.roleId,
        completed: taskData.completed || false,
        time_spent: taskData.timeSpent || 0,
        user_id: user.id,
        created_at: now,
        updated_at: now,
        due_date: taskData.dueDate,
        recurrence_id: taskData.recurrenceId,
        is_ritual: taskData.isRitual || false,
        // Removed priority and is_big_rock as they don't exist in the database schema
      }

      // Add to local state first for immediate feedback
      const newTaskForState: Task = {
        id: taskId,
        title: taskData.title || "New Task",
        description: taskData.description || "",
        quadrant: taskData.quadrant || "q2",
        roleId: taskData.roleId,
        completed: taskData.completed || false,
        timeSpent: taskData.timeSpent || 0,
        subtasks: taskData.subtasks || [],
        userId: user.id,
        createdAt: now,
        updatedAt: now,
        dueDate: taskData.dueDate,
        recurrenceId: taskData.recurrenceId,
        isRitual: taskData.isRitual || false,
        is_big_rock: taskData.is_big_rock || false,
        priority: taskData.priority || "", // Keep this for UI, even if not in DB
      }

      setTasks((prevTasks) => [newTaskForState, ...prevTasks])

      try {
        const { error: taskError } = await supabase.from("tasks").insert(newTask)

        if (taskError) {
          console.error("Error adding task:", taskError)
          toast({
            title: "Warning",
            description: "Task added locally but not synced to the server. Changes may be lost when you refresh.",
            variant: "warning",
          })
          return
        }

        // Add subtasks if any
        if (taskData.subtasks && taskData.subtasks.length > 0) {
          const subtasksForDb = taskData.subtasks.map((subtask) => ({
            id: subtask.id || uuidv4(),
            task_id: taskId,
            title: subtask.title,
            completed: subtask.completed || false,
            user_id: user.id,
          }))

          const { error: subtaskError } = await supabase.from("subtasks").insert(subtasksForDb)

          if (subtaskError) {
            console.error("Error adding subtasks:", subtaskError)
            toast({
              title: "Warning",
              description: "Task added but subtasks could not be saved to the server.",
              variant: "warning",
            })
          }
        }

        // Update cache with the new task
        try {
          const cachedTasksJson = localStorage.getItem("cachedTasks")
          if (cachedTasksJson) {
            const cachedTasks = JSON.parse(cachedTasksJson)
            localStorage.setItem("cachedTasks", JSON.stringify([newTaskForState, ...cachedTasks]))
          }
        } catch (cacheError) {
          console.warn("Error updating task cache:", cacheError)
        }

        toast({
          title: "Task added",
          description: "Task added successfully",
        })
      } catch (networkError) {
        console.error("Network error adding task:", networkError)
        toast({
          title: "Connection issue",
          description: "Task added locally but not synced to the server. Changes may be lost when you refresh.",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error in addTask:", error)
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateTask = async (updatedTask: Task) => {
    if (!user) return

    // If an external updateTask function is provided, use it
    if (externalUpdateTask) {
      return externalUpdateTask(updatedTask)
    }

    try {
      // Update local state first
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))

      // Update cache
      try {
        const cachedTasksJson = localStorage.getItem("cachedTasks")
        if (cachedTasksJson) {
          const cachedTasks = JSON.parse(cachedTasksJson)
          const updatedCache = cachedTasks.map((task: Task) => (task.id === updatedTask.id ? updatedTask : task))
          localStorage.setItem("cachedTasks", JSON.stringify(updatedCache))
        }
      } catch (cacheError) {
        console.warn("Error updating task cache:", cacheError)
      }

      // Create a copy of the task for database update
      const dbTask = {
        title: updatedTask.title,
        description: updatedTask.description || "",
        quadrant: updatedTask.quadrant,
        role_id: updatedTask.roleId,
        completed: updatedTask.completed,
        time_spent: updatedTask.timeSpent,
        updated_at: new Date().toISOString(),
        due_date: updatedTask.dueDate,
        recurrence_id: updatedTask.recurrenceId,
        is_ritual: updatedTask.isRitual,
        // Removed priority field as it doesn't exist in the database schema
      }

      try {
        // Then update in the database
        const { error: taskError } = await supabase
          .from("tasks")
          .update(dbTask)
          .eq("id", updatedTask.id)
          .eq("user_id", user.id)

        if (taskError) {
          console.error("Error updating task:", taskError)
          toast({
            title: "Warning",
            description: "Task updated locally but not synced to the server.",
            variant: "warning",
          })
          return
        }

        toast({
          title: "Task updated",
          description: "Task has been updated successfully",
        })
      } catch (networkError) {
        console.error("Network error updating task:", networkError)
        toast({
          title: "Connection issue",
          description: "Task updated locally but not synced to the server.",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error in updateTask:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!user) return

    // If an external deleteTask function is provided, use it
    if (externalDeleteTask) {
      return externalDeleteTask(taskId)
    }

    try {
      // Update local state first
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

      // Update cache
      try {
        const cachedTasksJson = localStorage.getItem("cachedTasks")
        if (cachedTasksJson) {
          const cachedTasks = JSON.parse(cachedTasksJson)
          const updatedCache = cachedTasks.filter((task: Task) => task.id !== taskId)
          localStorage.setItem("cachedTasks", JSON.stringify(updatedCache))
        }
      } catch (cacheError) {
        console.warn("Error updating task cache:", cacheError)
      }

      try {
        // Then delete from the database
        const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id)

        if (error) {
          console.error("Error deleting task:", error)
          toast({
            title: "Warning",
            description: "Task deleted locally but not synced to the server.",
            variant: "warning",
          })
          return
        }

        toast({
          title: "Task deleted",
          description: "Task deleted successfully",
        })
      } catch (networkError) {
        console.error("Network error deleting task:", networkError)
        toast({
          title: "Connection issue",
          description: "Task deleted locally but not synced to the server.",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error in deleteTask:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const toggleTaskCompletion = async (taskId: string) => {
    if (!user) return

    // If an external toggleTaskComplete function is provided, use it
    if (toggleTaskComplete) {
      return toggleTaskComplete(taskId)
    }

    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const newCompletedState = !task.completed

      // Update local state first
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, completed: newCompletedState } : t)))

      // Update cache
      try {
        const cachedTasksJson = localStorage.getItem("cachedTasks")
        if (cachedTasksJson) {
          const cachedTasks = JSON.parse(cachedTasksJson)
          const updatedCache = cachedTasks.map((t: Task) =>
            t.id === taskId ? { ...t, completed: newCompletedState } : t,
          )
          localStorage.setItem("cachedTasks", JSON.stringify(updatedCache))
        }
      } catch (cacheError) {
        console.warn("Error updating task cache:", cacheError)
      }

      try {
        const { error } = await supabase
          .from("tasks")
          .update({
            completed: newCompletedState,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error toggling task completion:", error)
          toast({
            title: "Warning",
            description: "Task status updated locally but not synced to the server.",
            variant: "warning",
          })
          return
        }

        toast({
          title: newCompletedState ? "Task completed" : "Task reopened",
          description: `Task has been marked as ${newCompletedState ? "completed" : "not completed"}`,
        })
      } catch (networkError) {
        console.error("Network error toggling task completion:", networkError)
        toast({
          title: "Connection issue",
          description: "Task status updated locally but not synced to the server.",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error in toggleTaskCompletion:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const moveTask = async (taskId: string, targetQuadrant: string) => {
    if (!user) return

    try {
      // Update local state first
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, quadrant: targetQuadrant } : task)),
      )

      // Update cache
      try {
        const cachedTasksJson = localStorage.getItem("cachedTasks")
        if (cachedTasksJson) {
          const cachedTasks = JSON.parse(cachedTasksJson)
          const updatedCache = cachedTasks.map((task: Task) =>
            task.id === taskId ? { ...task, quadrant: targetQuadrant } : task,
          )
          localStorage.setItem("cachedTasks", JSON.stringify(updatedCache))
        }
      } catch (cacheError) {
        console.warn("Error updating task cache:", cacheError)
      }

      try {
        const { error } = await supabase
          .from("tasks")
          .update({
            quadrant: targetQuadrant,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error moving task:", error)
          toast({
            title: "Warning",
            description: "Task moved locally but not synced to the server.",
            variant: "warning",
          })
          return
        }

        toast({
          title: "Task moved",
          description: "Task moved successfully",
        })
      } catch (networkError) {
        console.error("Network error moving task:", networkError)
        toast({
          title: "Connection issue",
          description: "Task moved locally but not synced to the server.",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error in moveTask:", error)
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateTimeSpent = async (taskId: string, additionalSeconds: number) => {
    if (!user) return

    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const newTimeSpent = (task.timeSpent || 0) + additionalSeconds

      // Update local state first
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, timeSpent: newTimeSpent } : t)))

      // Update cache
      try {
        const cachedTasksJson = localStorage.getItem("cachedTasks")
        if (cachedTasksJson) {
          const cachedTasks = JSON.parse(cachedTasksJson)
          const updatedCache = cachedTasks.map((t: Task) => (t.id === taskId ? { ...t, timeSpent: newTimeSpent } : t))
          localStorage.setItem("cachedTasks", JSON.stringify(updatedCache))
        }
      } catch (cacheError) {
        console.warn("Error updating task cache:", cacheError)
      }

      try {
        const { error } = await supabase
          .from("tasks")
          .update({
            time_spent: newTimeSpent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error updating time spent:", error)
          toast({
            title: "Warning",
            description: "Time spent updated locally but not synced to the server.",
            variant: "warning",
          })
          return
        }

        toast({
          title: "Time spent updated",
          description: "Time spent updated successfully",
        })
      } catch (networkError) {
        console.error("Network error updating time spent:", networkError)
        toast({
          title: "Connection issue",
          description: "Time spent updated locally but not synced to the server.",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Error in updateTimeSpent:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const value: TasksContextType = {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    moveTask,
    updateTimeSpent,
    refreshTasks: fetchTasks,
  }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider")
  }
  return context
}

export { TasksContext }

