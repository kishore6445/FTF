"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Target, Info, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task, Role } from "@/lib/types"

interface SimplifiedQuadrantGridProps {
  tasks: Task[]
  roles: Role[]
  onAddTask: (quadrant: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string) => void
}

export default function SimplifiedQuadrantGrid({
  tasks,
  roles,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
}: SimplifiedQuadrantGridProps) {
  const [showHelp, setShowHelp] = useState(false)

  // Filter tasks by quadrant
  const q1Tasks = tasks.filter((task) => task.quadrant === "q1" && !task.completed)
  const q2Tasks = tasks.filter((task) => task.quadrant === "q2" && !task.completed)
  const q3Tasks = tasks.filter((task) => task.quadrant === "q3" && !task.completed)
  const q4Tasks = tasks.filter((task) => task.quadrant === "q4" && !task.completed)

  const renderTask = (task: Task) => {
    const role = roles.find((r) => r.id === task.roleId)

    return (
      <div key={task.id} className="p-3 border rounded-md bg-white dark:bg-gray-800 shadow-sm mb-2">
        <div className="flex items-start gap-2">
          <Checkbox checked={task.completed} onCheckedChange={() => onToggleTaskCompletion(task.id)} className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="font-medium">{task.title}</div>
            {task.description && <div className="text-sm text-muted-foreground line-clamp-2">{task.description}</div>}
            <div className="flex flex-wrap gap-1 mt-1">
              {role && (
                <Badge variant="outline" style={{ backgroundColor: `${role.color}20`, borderColor: role.color }}>
                  {role.name}
                </Badge>
              )}
              {task.dueDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), "MMM d")}
                </Badge>
              )}
              {task.is_big_rock && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                >
                  <Target className="h-3 w-3 mr-1" />
                  Big Rock
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditTask(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Time Management Matrix</h2>
        <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)}>
          <Info className="h-4 w-4 mr-1" />
          {showHelp ? "Hide" : "Show"} Help
        </Button>
      </div>

      {showHelp && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <h3 className="font-medium mb-2">Covey's Time Management Matrix</h3>
            <p className="text-sm mb-2">
              This matrix helps you prioritize tasks based on their importance and urgency:
            </p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>
                <strong>Q1 (Important & Urgent):</strong> Crises, pressing problems, deadline-driven projects
              </li>
              <li>
                <strong>Q2 (Important & Not Urgent):</strong> Planning, prevention, relationship building, true
                recreation
              </li>
              <li>
                <strong>Q3 (Not Important & Urgent):</strong> Interruptions, some calls, some meetings, popular
                activities
              </li>
              <li>
                <strong>Q4 (Not Important & Not Urgent):</strong> Trivia, busy work, time wasters, pleasant activities
              </li>
            </ul>
            <p className="text-sm mt-2 font-medium">
              Focus on Q2 tasks to prevent crises and achieve work-life balance.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Q1: Important & Urgent */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="bg-red-50 dark:bg-red-900/20 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-red-800 dark:text-red-300">Q1: Important & Urgent</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                onClick={() => onAddTask("q1")}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {q1Tasks.length > 0 ? (
              <div className="space-y-2">{q1Tasks.map((task) => renderTask(task))}</div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No tasks in this quadrant</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Q2: Important & Not Urgent */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-800 dark:text-blue-300">Q2: Important & Not Urgent</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                onClick={() => onAddTask("q2")}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {q2Tasks.length > 0 ? (
              <div className="space-y-2">{q2Tasks.map((task) => renderTask(task))}</div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No tasks in this quadrant</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Q3: Not Important & Urgent */}
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-yellow-800 dark:text-yellow-300">Q3: Not Important & Urgent</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                onClick={() => onAddTask("q3")}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {q3Tasks.length > 0 ? (
              <div className="space-y-2">{q3Tasks.map((task) => renderTask(task))}</div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No tasks in this quadrant</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Q4: Not Important & Not Urgent */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-800 dark:text-gray-300">Q4: Not Important & Not Urgent</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onAddTask("q4")}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {q4Tasks.length > 0 ? (
              <div className="space-y-2">{q4Tasks.map((task) => renderTask(task))}</div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No tasks in this quadrant</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

