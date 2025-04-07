"use client"

import { useState } from "react"
import SimplifiedTaskInbox from "@/components/simplified-task-inbox"
import type { Task, Role } from "@/lib/types"

interface TaskInboxClientWrapperProps {
  initialTasks: Task[]
  initialRoles: Role[]
}

export default function TaskInboxClientWrapper({ initialTasks, initialRoles }: TaskInboxClientWrapperProps) {
  const [tasks, setTasks] = useState(initialTasks)

  // Client-side event handlers
  const handleAddTask = () => {
    // Implementation will be added later
    console.log("Add task")
  }

  const handleEditTask = (task: Task) => {
    // Implementation will be added later
    console.log("Edit task", task.id)
  }

  const handleDeleteTask = (taskId: string) => {
    // Implementation will be added later
    console.log("Delete task", taskId)
  }

  const handleToggleTaskCompletion = (taskId: string) => {
    // Implementation will be added later
    console.log("Toggle task completion", taskId)

    // For demonstration purposes, let's toggle the task completion state in the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    )
  }

  const handleToggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    // Implementation will be added later
    console.log("Toggle subtask completion", taskId, subtaskId)

    // For demonstration purposes, let's toggle the subtask completion state in the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId && task.subtasks
          ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
              ),
            }
          : task,
      ),
    )
  }

  return (
    <SimplifiedTaskInbox
      tasks={tasks}
      roles={initialRoles}
      onAddTask={handleAddTask}
      onEditTask={handleEditTask}
      onDeleteTask={handleDeleteTask}
      onToggleTaskCompletion={handleToggleTaskCompletion}
      onToggleSubtaskCompletion={handleToggleSubtaskCompletion}
    />
  )
}

