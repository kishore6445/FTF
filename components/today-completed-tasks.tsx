"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { Task, Role } from "@/lib/types"
import { useEffect } from "react"

interface TodayCompletedTasksProps {
  completedTasks: Task[]
  roles: Role[]
  toggleTaskCompletion: (taskId: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
}

export default function TodayCompletedTasks({
  completedTasks,
  roles,
  toggleTaskCompletion,
  deleteTask,
}: TodayCompletedTasksProps) {
  // Get today's completed tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Use all completed tasks for now to debug the issue
  const todayCompletedTasks = completedTasks

  // Sort by most recently completed
  const sortedTasks = [...todayCompletedTasks].sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
  )

  // Get role name by ID
  const getRoleName = (roleId: string | undefined) => {
    if (!roleId) return "No Role"
    const role = roles.find((r) => r.id === roleId)
    return role ? role.name : "Unknown Role"
  }

  // Get role color by ID
  const getRoleColor = (roleId: string | undefined) => {
    if (!roleId) return "#808080"
    const role = roles.find((r) => r.id === roleId)
    return role ? role.color : "#808080"
  }

  // Log for debugging
  useEffect(() => {
    console.log("All completed tasks:", completedTasks)
    console.log("Today's date:", today)
    completedTasks.forEach((task) => {
      const taskDate = new Date(task.updatedAt || 0)
      console.log(
        `Task ${task.title} updated at: ${task.updatedAt}, date: ${taskDate}, is today: ${taskDate.getTime() === today.getTime()}`,
      )
    })
  }, [completedTasks, today])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Today's Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">
            No tasks completed today yet. Complete a task to see it here!
          </p>
        ) : (
          <ul className="space-y-2">
            {sortedTasks.map((task) => (
              <li key={task.id} className="flex items-start gap-2 group">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-medium line-through decoration-2 cursor-pointer"
                    >
                      {task.title}
                    </label>
                    <Badge style={{ backgroundColor: getRoleColor(task.roleId) }} className="text-xs whitespace-nowrap">
                      {getRoleName(task.roleId)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

