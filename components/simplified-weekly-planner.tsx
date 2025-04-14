"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { PlusCircle, ChevronLeft, ChevronRight, Info } from "lucide-react"
import TaskCard from "@/components/task-card"
import type { Task, Role } from "@/lib/types"

interface SimplifiedWeeklyPlannerProps {
  tasks: Task[]
  roles: Role[]
  onAddTask: (date?: Date) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string) => void
  onToggleSubtaskCompletion: (taskId: string, subtaskId: string) => void
}

export default function SimplifiedWeeklyPlanner({
  tasks,
  roles,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
  onToggleSubtaskCompletion,
}: SimplifiedWeeklyPlannerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [showHelp, setShowHelp] = useState(false)

  // Generate days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  // Get tasks for a specific day
  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), date) && !task.completed)
  }

  // Get role by ID
  const getRoleById = (roleId?: string) => {
    if (!roleId) return undefined
    return roles.find((role) => role.id === roleId)
  }

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7))
  }

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7))
  }

  // Go to current week
  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Weekly Planner</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)}>
            <Info className="h-4 w-4 mr-1" />
            {showHelp ? "Hide" : "Show"} Help
          </Button>
          <Button onClick={() => onAddTask()} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {showHelp && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <h3 className="font-medium mb-2">Weekly Planning Tips</h3>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Start by adding your "big rocks" (most important tasks) first</li>
              <li>Focus on Q2 tasks (Important but Not Urgent) to be proactive</li>
              <li>Balance your tasks across different roles in your life</li>
              <li>Leave some buffer time for unexpected Q1 emergencies</li>
              <li>Review and adjust your plan daily as needed</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Week
        </Button>
        <div className="text-center">
          <h2 className="font-medium">
            {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
          </h2>
          <Button variant="link" size="sm" onClick={goToCurrentWeek}>
            Go to Current Week
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          Next Week
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day)
          const isToday = isSameDay(day, new Date())

          return (
            <Card key={index} className={`${isToday ? "border-primary" : ""}`}>
              <CardHeader className={`pb-2 ${isToday ? "bg-primary/10" : ""}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {format(day, "EEE")}
                    <span className="block text-xs text-muted-foreground">{format(day, "MMM d")}</span>
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Task for {format(day, "EEEE, MMMM d")}</DialogTitle>
                      </DialogHeader>
                      {/* This would integrate with your task form component */}
                      <div className="py-4">
                        <Button onClick={() => onAddTask(day)}>Add Task</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-2 h-[300px] overflow-y-auto">
                {dayTasks.length > 0 ? (
                  <div className="space-y-2">
                    {dayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        role={getRoleById(task.roleId)}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onToggleCompletion={onToggleTaskCompletion}
                        onToggleSubtaskCompletion={onToggleSubtaskCompletion}
                        compact={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground">
                    <div>
                      <p>No tasks</p>
                      <Button variant="ghost" size="sm" className="mt-1" onClick={() => onAddTask(day)}>
                        Add Task
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

