"use client"

import { useState, useEffect } from "react"
import { useDrop } from "react-dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TaskCard from "@/components/task-card"
import { Plus, AlertCircle } from "lucide-react"
import type { Task, Role } from "@/lib/types"
import { useTasks } from "@/contexts/tasks-context"
import { format, parseISO, isBefore } from "date-fns"

interface QuadrantProps {
  title: string
  description: string
  quadrantId: string
  tasks: Task[]
  roles: Role[]
  onMoveTask: (taskId: string, targetQuadrant: string) => void
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onUpdateTask: (task: Task) => void
  onUpdateTimeSpent: (taskId: string, additionalSeconds: number) => void
  onAddTask: (quadrant: string) => void
}

export default function Quadrant({
  title,
  description,
  quadrantId,
  tasks,
  roles,
  onMoveTask,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onUpdateTimeSpent,
  onAddTask,
}: QuadrantProps) {
  const { syncRitualWithQuadrants } = useTasks()
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [showDueTasks, setShowDueTasks] = useState(true)
  const [showRitualTasks, setShowRitualTasks] = useState(true)

  // Set up drop target for drag and drop
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: string }) => {
      onMoveTask(item.id, quadrantId)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }))

  // Filter tasks based on due date and ritual status
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd")

    const filtered = tasks.filter((task) => {
      // Filter by ritual status
      if (task.isRitual && !showRitualTasks) return false

      // Filter by due date
      if (task.dueDate) {
        const isDueToday = task.dueDate === today
        const isPastDue = isBefore(parseISO(task.dueDate), parseISO(today))

        if (!showDueTasks && (isDueToday || isPastDue)) return false
      }

      return true
    })

    setFilteredTasks(filtered)
  }, [tasks, showDueTasks, showRitualTasks])

  // Count tasks by type
  const dueTodayCount = tasks.filter((task) => {
    const today = format(new Date(), "yyyy-MM-dd")
    return task.dueDate === today
  }).length

  const ritualTasksCount = tasks.filter((task) => task.isRitual).length

  return (
    <Card
      ref={drop}
      className={`h-full ${isOver ? "ring-2 ring-primary ring-opacity-50" : ""} transition-all duration-200`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onAddTask(quadrantId)}
            title={`Add task to ${title}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {(dueTodayCount > 0 || ritualTasksCount > 0) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {dueTodayCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowDueTasks(!showDueTasks)}
              >
                <AlertCircle className={`h-3 w-3 mr-1 ${showDueTasks ? "text-amber-500" : "text-muted-foreground"}`} />
                {showDueTasks ? "Hide" : "Show"} Due Today ({dueTodayCount})
              </Button>
            )}
            {ritualTasksCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowRitualTasks(!showRitualTasks)}
              >
                <AlertCircle
                  className={`h-3 w-3 mr-1 ${showRitualTasks ? "text-blue-500" : "text-muted-foreground"}`}
                />
                {showRitualTasks ? "Hide" : "Show"} Rituals ({ritualTasksCount})
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No tasks in this quadrant</p>
            <p className="text-xs mt-1">Drag tasks here or add a new one</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            // Find the role for this task
            const role = roles.find((r) => r.id === task.roleId)

            // Check if task is due today
            const isDueToday = task.dueDate === format(new Date(), "yyyy-MM-dd")

            return (
              <div
                key={task.id}
                className={`${isDueToday ? "ring-1 ring-amber-200 bg-amber-50/30" : ""} 
                           ${task.isRitual ? "ring-1 ring-blue-200 bg-blue-50/30" : ""} 
                           rounded-md`}
              >
                <TaskCard
                  task={task}
                  roles={roles}
                  role={role}
                  onToggleComplete={() => onToggleComplete(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                  onUpdate={onUpdateTask}
                  onUpdateTimeSpent={onUpdateTimeSpent}
                />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

