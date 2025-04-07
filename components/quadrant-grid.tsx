"use client"

import { useMemo, useState } from "react"
import { useDrop } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Loader2, Info, ArrowUpDown, ListFilter } from "lucide-react"
import type { Task, Role } from "@/lib/types"
import TaskCard from "@/components/task-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TaskPriorityManager from "@/components/task-priority-manager"
import PriorityLegend from "@/components/priority-legend"
import SimplifiedTaskDialog from "@/components/simplified-task-dialog"

interface QuadrantGridProps {
  tasks?: Task[]
  roles?: Role[]
  moveTask: (taskId: string, targetQuadrant: string) => void
  toggleTaskCompletion: (taskId: string) => void
  deleteTask: (taskId: string) => void
  updateTask: (task: Task) => void
  onUpdateTimeSpent?: (taskId: string, additionalSeconds: number) => void
  onAddTask?: (quadrant: string) => void
  loading?: boolean
  onTaskAdded?: () => void
}

export default function QuadrantGrid({
  tasks = [], // Provide default empty array
  roles = [],
  moveTask,
  toggleTaskCompletion,
  deleteTask,
  updateTask,
  onUpdateTimeSpent,
  onAddTask,
  loading = false,
  onTaskAdded,
}: QuadrantGridProps) {
  // State for priority manager
  const [showPriorityManager, setShowPriorityManager] = useState(false)
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null)

  // Filter out completed tasks and group by quadrant
  const tasksByQuadrant = useMemo(() => {
    // Ensure tasks is an array before filtering
    const tasksArray = Array.isArray(tasks) ? tasks : []

    // Include all incomplete tasks, including rituals
    const incompleteTasks = tasksArray.filter((task) => !task.completed)

    // Helper function to sort tasks by priority
    const sortByPriority = (tasks: Task[]) => {
      return [...tasks].sort((a, b) => {
        // If both have priority, sort by priority
        if (a.priority && b.priority) {
          // Extract the letter and number
          const aPriority = a.priority.charAt(0)
          const aNumber = Number.parseInt(a.priority.substring(1))
          const bPriority = b.priority.charAt(0)
          const bNumber = Number.parseInt(b.priority.substring(1))

          // Compare letters first (A comes before B)
          if (aPriority !== bPriority) {
            return aPriority.localeCompare(bPriority)
          }

          // Then compare numbers
          return aNumber - bNumber
        }

        // If only one has priority, it comes first
        if (a.priority) return -1
        if (b.priority) return 1

        // If neither has priority, sort by creation date (newest first)
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }

        return 0
      })
    }

    return {
      q1: sortByPriority(incompleteTasks.filter((task) => task.quadrant === "q1")),
      q2: sortByPriority(incompleteTasks.filter((task) => task.quadrant === "q2" || (task.isRitual && !task.quadrant))),
      q3: sortByPriority(incompleteTasks.filter((task) => task.quadrant === "q3")),
      q4: sortByPriority(incompleteTasks.filter((task) => task.quadrant === "q4")),
    }
  }, [tasks])

  // Calculate completion percentages
  const completionPercentages = useMemo(() => {
    // Ensure tasks is an array before filtering
    const tasksArray = Array.isArray(tasks) ? tasks : []

    const calculatePercentage = (quadrant: string) => {
      const quadrantTasks = tasksArray.filter((task) => task.quadrant === quadrant)
      if (quadrantTasks.length === 0) return 0
      const completedTasks = quadrantTasks.filter((task) => task.completed).length
      return Math.round((completedTasks / quadrantTasks.length) * 100)
    }

    return {
      q1: calculatePercentage("q1"),
      q2: calculatePercentage("q2"),
      q3: calculatePercentage("q3"),
      q4: calculatePercentage("q4"),
    }
  }, [tasks])

  // Handle opening the priority manager for a specific quadrant
  const handleOpenPriorityManager = (quadrant: string) => {
    setSelectedQuadrant(quadrant)
    setShowPriorityManager(true)
  }

  // Handle closing the priority manager
  const handleClosePriorityManager = () => {
    setShowPriorityManager(false)
    setSelectedQuadrant(null)
  }

  // Handle saving priorities from the priority manager
  const handleSavePriorities = (updatedTasks: Task[]) => {
    // Update each task
    updatedTasks.forEach((task) => {
      updateTask(task)
    })

    // Close the priority manager
    handleClosePriorityManager()
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
      {/* Priority Legend at the top */}
      <PriorityLegend />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrant
          id="q1"
          title="Urgent & Important"
          description="Critical activities that require immediate attention"
          tasks={tasksByQuadrant.q1}
          roles={roles}
          moveTask={moveTask}
          toggleTaskCompletion={toggleTaskCompletion}
          deleteTask={deleteTask}
          updateTask={updateTask}
          onUpdateTimeSpent={onUpdateTimeSpent}
          onAddTask={onAddTask ? () => onAddTask("q1") : undefined}
          onManagePriorities={() => handleOpenPriorityManager("q1")}
          className="quadrant-card q1-card"
          completionPercentage={completionPercentages.q1}
          tooltipContent="Focus on these tasks first. They are critical and need immediate attention."
          onTaskAdded={onTaskAdded}
        />

        <Quadrant
          id="q2"
          title="Important, Not Urgent"
          description="Strategic activities that contribute to long-term goals"
          tasks={tasksByQuadrant.q2}
          roles={roles}
          moveTask={moveTask}
          toggleTaskCompletion={toggleTaskCompletion}
          deleteTask={deleteTask}
          updateTask={updateTask}
          onUpdateTimeSpent={onUpdateTimeSpent}
          onAddTask={onAddTask ? () => onAddTask("q2") : undefined}
          onManagePriorities={() => handleOpenPriorityManager("q2")}
          className="quadrant-card q2-card"
          completionPercentage={completionPercentages.q2}
          tooltipContent="These tasks build your future. Schedule time for them to avoid them becoming urgent."
          onTaskAdded={onTaskAdded}
        />

        <Quadrant
          id="q3"
          title="Urgent, Not Important"
          description="Interruptions and pressing matters with little value"
          tasks={tasksByQuadrant.q3}
          roles={roles}
          moveTask={moveTask}
          toggleTaskCompletion={toggleTaskCompletion}
          deleteTask={deleteTask}
          updateTask={updateTask}
          onUpdateTimeSpent={onUpdateTimeSpent}
          onAddTask={onAddTask ? () => onAddTask("q3") : undefined}
          onManagePriorities={() => handleOpenPriorityManager("q3")}
          className="quadrant-card q3-card"
          completionPercentage={completionPercentages.q3}
          tooltipContent="Try to delegate or minimize these tasks. They create a false sense of importance."
          onTaskAdded={onTaskAdded}
        />

        <Quadrant
          id="q4"
          title="Not Urgent, Not Important"
          description="Time-wasting activities with little or no value"
          tasks={tasksByQuadrant.q4}
          roles={roles}
          moveTask={moveTask}
          toggleTaskCompletion={toggleTaskCompletion}
          deleteTask={deleteTask}
          updateTask={updateTask}
          onUpdateTimeSpent={onUpdateTimeSpent}
          onAddTask={onAddTask ? () => onAddTask("q4") : undefined}
          onManagePriorities={() => handleOpenPriorityManager("q4")}
          className="quadrant-card q4-card"
          completionPercentage={completionPercentages.q4}
          tooltipContent="Eliminate these tasks when possible. They drain your time and energy."
          onTaskAdded={onTaskAdded}
        />

        {/* Priority Manager Dialog */}
        {showPriorityManager && selectedQuadrant && (
          <TaskPriorityManager
            tasks={tasksByQuadrant[selectedQuadrant as keyof typeof tasksByQuadrant]}
            quadrantName={selectedQuadrant}
            onClose={handleClosePriorityManager}
            onSave={handleSavePriorities}
          />
        )}
      </div>
    </div>
  )
}

interface QuadrantProps {
  id: string
  title: string
  description: string
  tasks: Task[]
  roles?: Role[]
  moveTask: (taskId: string, targetQuadrant: string) => void
  toggleTaskCompletion: (taskId: string) => void
  deleteTask: (taskId: string) => void
  updateTask: (task: Task) => void
  onUpdateTimeSpent?: (taskId: string, additionalSeconds: number) => void
  onAddTask?: () => void
  onManagePriorities: () => void
  className?: string
  completionPercentage: number
  tooltipContent?: string
  onTaskAdded?: () => void
}

function Quadrant({
  id,
  title,
  description,
  tasks = [], // Provide default empty array
  roles = [],
  moveTask,
  toggleTaskCompletion,
  deleteTask,
  updateTask,
  onUpdateTimeSpent,
  onAddTask,
  onManagePriorities,
  className,
  completionPercentage,
  tooltipContent,
  onTaskAdded,
}: QuadrantProps) {
  const [{ isOver }, drop] = useDrop({
    accept: "task",
    drop: (item: { id: string }) => {
      moveTask(item.id, id)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  // Sort options
  const [sortOption, setSortOption] = useState<string>("priority")

  // Sort tasks based on the selected option
  const sortedTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return []

    const tasksCopy = [...tasks]

    switch (sortOption) {
      case "priority":
        return tasksCopy.sort((a, b) => {
          if (a.priority && b.priority) {
            const aPriority = a.priority.charAt(0)
            const aNumber = Number.parseInt(a.priority.substring(1))
            const bPriority = b.priority.charAt(0)
            const bNumber = Number.parseInt(b.priority.substring(1))

            if (aPriority !== bPriority) {
              return aPriority.localeCompare(bPriority)
            }
            return aNumber - bNumber
          }
          if (a.priority) return -1
          if (b.priority) return 1
          return 0
        })
      case "alphabetical":
        return tasksCopy.sort((a, b) => a.title.localeCompare(b.title))
      case "newest":
        return tasksCopy.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return 0
        })
      case "oldest":
        return tasksCopy.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
          return 0
        })
      case "due-date":
        return tasksCopy.sort((a, b) => {
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          }
          if (a.dueDate) return -1
          if (b.dueDate) return 1
          return 0
        })
      default:
        return tasksCopy
    }
  }, [tasks, sortOption])

  // Add these functions inside the Quadrant component, before the return statement
  const moveTaskUp = (taskId: string) => {
    const taskIndex = sortedTasks.findIndex((task) => task.id === taskId)
    if (taskIndex <= 0) return

    // Get the current priority letter (A, B, C) from the task being moved
    const currentTask = sortedTasks[taskIndex]
    const priorityLetter = currentTask.priority?.charAt(0) || "A"

    // Create updated tasks with new positions
    const updatedTasks = [...sortedTasks]

    // Swap positions
    ;[updatedTasks[taskIndex], updatedTasks[taskIndex - 1]] = [updatedTasks[taskIndex - 1], updatedTasks[taskIndex]]

    // Update priorities based on new positions
    updatedTasks.forEach((task, idx) => {
      // Only update tasks with the same priority letter or no priority
      if (!task.priority || task.priority.charAt(0) === priorityLetter) {
        const newPriority = `${priorityLetter}${idx + 1}`
        if (task.priority !== newPriority) {
          updateTask({ ...task, priority: newPriority })
        }
      }
    })
  }

  const moveTaskDown = (taskId: string) => {
    const taskIndex = sortedTasks.findIndex((task) => task.id === taskId)
    if (taskIndex >= sortedTasks.length - 1) return

    // Get the current priority letter (A, B, C) from the task being moved
    const currentTask = sortedTasks[taskIndex]
    const priorityLetter = currentTask.priority?.charAt(0) || "A"

    // Create updated tasks with new positions
    const updatedTasks = [...sortedTasks]

    // Swap positions
    ;[updatedTasks[taskIndex], updatedTasks[taskIndex + 1]] = [updatedTasks[taskIndex + 1], updatedTasks[taskIndex]]

    // Update priorities based on new positions
    updatedTasks.forEach((task, idx) => {
      // Only update tasks with the same priority letter or no priority
      if (!task.priority || task.priority.charAt(0) === priorityLetter) {
        const newPriority = `${priorityLetter}${idx + 1}`
        if (task.priority !== newPriority) {
          updateTask({ ...task, priority: newPriority })
        }
      }
    })
  }

  return (
    <div
      ref={drop}
      className={`flex flex-col ${className} ${isOver ? "ring-2 ring-primary scale-[1.02] transition-transform" : ""}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            {tooltipContent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltipContent}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Sort and Priority Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort Tasks</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortOption("priority")}>By Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("alphabetical")}>Alphabetically</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("newest")}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("oldest")}>Oldest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("due-date")}>By Due Date</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onManagePriorities}>
                  <ListFilter className="h-4 w-4 mr-2" />
                  Manage Priorities
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-2 mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-1.5" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {Array.isArray(sortedTasks) && sortedTasks.length > 0 ? (
          sortedTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-enter"
              style={{ animationDelay: `${sortedTasks.indexOf(task) * 0.05}s` }}
            >
              <TaskCard
                task={task}
                roles={roles}
                onToggleComplete={() => toggleTaskCompletion(task.id)}
                onDelete={() => deleteTask(task.id)}
                onUpdate={updateTask}
                onUpdateTimeSpent={onUpdateTimeSpent}
                onMoveUp={moveTaskUp}
                onMoveDown={moveTaskDown}
                isFirst={index === 0}
                isLast={index === sortedTasks.length - 1}
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">No tasks in this quadrant</p>
        )}
        <div className="flex gap-2">
          {onAddTask ? (
            <Button
              variant="outline"
              className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 border-dashed"
              onClick={onAddTask}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          ) : (
            <SimplifiedTaskDialog
              roles={roles}
              defaultQuadrant={id}
              onTaskAdded={onTaskAdded}
              trigger={
                <Button
                  variant="outline"
                  className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              }
            />
          )}
          <Button
            variant="outline"
            className="justify-center text-muted-foreground hover:text-foreground hover:bg-background/80"
            onClick={onManagePriorities}
          >
            <ListFilter className="h-4 w-4" />
            <span className="sr-only">Manage Priorities</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

