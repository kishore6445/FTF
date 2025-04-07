"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react"
import type { Task, Role } from "@/lib/types"
import TaskCard from "@/components/task-card"

interface CompletedTasksSectionProps {
  completedTasks: Task[]
  roles: Role[]
  toggleTaskCompletion: (taskId: string) => void
  deleteTask: (taskId: string) => void
}

export default function CompletedTasksSection({
  completedTasks,
  roles,
  toggleTaskCompletion,
  deleteTask,
}: CompletedTasksSectionProps) {
  const [expanded, setExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)

  // Sort by most recently completed
  const sortedTasks = [...completedTasks].sort(
    (a, b) => new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime(),
  )

  // Limit to 10 tasks unless showAll is true
  const displayedTasks = showAll ? sortedTasks : sortedTasks.slice(0, 10)

  // Group tasks by date completed (using updatedAt as proxy)
  const tasksByDate = displayedTasks.reduce(
    (acc, task) => {
      const date = new Date(task.updatedAt || "").toLocaleDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(task)
      return acc
    },
    {} as Record<string, Task[]>,
  )

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            Completed Tasks
            <span className="ml-2 text-sm font-normal text-muted-foreground">({completedTasks.length})</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-2">
          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed tasks yet</p>
              <p className="text-sm mt-2">Complete a task to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(tasksByDate).map(([date, tasks]) => (
                <div key={date} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{date}</h4>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        roles={roles}
                        onToggleComplete={() => toggleTaskCompletion(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        onUpdate={() => {}} // Completed tasks can't be edited
                      />
                    ))}
                  </div>
                </div>
              ))}

              {completedTasks.length > 10 && (
                <Button variant="outline" className="w-full mt-2" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Show Less" : `Show All (${completedTasks.length})`}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

