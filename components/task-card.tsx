"use client"

import { useState } from "react"
import { useDrag } from "react-dnd"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Clock,
  Target,
  MoreHorizontal,
  Edit,
  Trash2,
  Timer,
  ListPlus,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  ChevronUp,
  ChevronDown,
  Compass,
  ListTodo,
  CalendarIcon,
  RotateCcw,
  Link2,
  PlayCircle,
  AlertCircle,
  CheckCircle,
  Circle,
} from "lucide-react"
import { format } from "date-fns"
import type { Task, Role } from "@/lib/types"
import MiniPomodoro from "@/components/mini-pomodoro"
import SubtaskManager from "@/components/subtask-manager"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TaskCardProps {
  task: Task
  roles?: Role[]
  role?: Role
  onToggleComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onUpdate: (task: Task) => void
  onUpdateTimeSpent?: (taskId: string, additionalSeconds: number) => void
  compact?: boolean
  onMoveUp?: (taskId: string) => void
  onMoveDown?: (taskId: string) => void
  isFirst?: boolean
  isLast?: boolean
}

export default function TaskCard({
  task,
  roles = [],
  role,
  onToggleComplete,
  onDelete,
  onUpdate,
  onUpdateTimeSpent,
  compact = false,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(!compact)
  const [showTimer, setShowTimer] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("basic")

  // Form state for editing
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || "")
  const [editQuadrant, setEditQuadrant] = useState(task.quadrant)
  const [editRoleId, setEditRoleId] = useState(task.roleId || "")
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(task.dueDate ? new Date(task.dueDate) : undefined)
  const [editStartDate, setEditStartDate] = useState<Date | undefined>(
    task.startDate ? new Date(task.startDate) : undefined,
  )
  const [editPriority, setEditPriority] = useState(task.priority || "")
  const [editIsBigRock, setEditIsBigRock] = useState(task.is_big_rock || false)
  const [editIsRitual, setEditIsRitual] = useState(task.isRitual || false)
  const [editFrequency, setEditFrequency] = useState(task.frequency || "one-time")
  const [editStatus, setEditStatus] = useState(task.status || "to-do")
  const [editLinks, setEditLinks] = useState(task.links || "")
  const [editPomodoroRequired, setEditPomodoroRequired] = useState(task.pomodoroRequired || false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)

  // Set up drag source
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  // Get quadrant color
  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "q1":
        return "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "q2":
        return "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "q3":
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "q4":
        return "bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
      default:
        return "bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "to-do":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
      case "in-progress":
        return "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "done":
        return "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "to-do":
        return <AlertCircle className="h-3 w-3 mr-1" />
      case "in-progress":
        return <PlayCircle className="h-3 w-3 mr-1" />
      case "done":
        return <CheckCircle2 className="h-3 w-3 mr-1" />
      default:
        return <AlertCircle className="h-3 w-3 mr-1" />
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "one-time":
        return "One-time"
      case "daily":
        return "Daily"
      case "weekly":
        return "Weekly"
      case "monthly":
        return "Monthly"
      case "quarterly":
        return "Quarterly"
      case "yearly":
        return "Yearly"
      default:
        return "One-time"
    }
  }

  const handleSubtasksChange = (newSubtasks: Task["subtasks"]) => {
    const updatedTask = {
      ...task,
      subtasks: newSubtasks,
    }
    onUpdate(updatedTask)
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editTitle,
          description: editDescription || null,
          quadrant: editQuadrant,
          role_id: editRoleId || null,
          due_date: editDueDate ? format(editDueDate, "yyyy-MM-dd") : null,
          start_date: editStartDate ? format(editStartDate, "yyyy-MM-dd") : null,
          priority: editPriority || null,
          is_big_rock: editIsBigRock,
          is_ritual: editIsRitual,
          frequency: editFrequency || "one-time",
          status: editStatus || "to-do",
          links: editLinks || null,
          pomodoro_required: editPomodoroRequired,
        })
        .eq("id", task.id)

      if (error) {
        console.error("Error updating task:", error)
        toast({
          title: "Error",
          description: "Failed to update task. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Update local state
      const updatedTask = {
        ...task,
        title: editTitle,
        description: editDescription,
        quadrant: editQuadrant,
        roleId: editRoleId,
        dueDate: editDueDate ? format(editDueDate, "yyyy-MM-dd") : undefined,
        startDate: editStartDate ? format(editStartDate, "yyyy-MM-dd") : undefined,
        is_big_rock: editIsBigRock,
        isRitual: editIsRitual,
        priority: editPriority,
        frequency: editFrequency,
        status: editStatus,
        links: editLinks,
        pomodoroRequired: editPomodoroRequired,
      }

      onUpdate(updatedTask)

      toast({
        title: "Success",
        description: "Task updated successfully!",
      })

      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getQuadrantInfo = (q: string) => {
    switch (q) {
      case "q1":
        return {
          label: "Q1: Urgent & Important",
          icon: <Clock className="h-4 w-4 text-red-500" />,
          description: "Critical tasks that need immediate attention",
        }
      case "q2":
        return {
          label: "Q2: Important, Not Urgent",
          icon: <Compass className="h-4 w-4 text-blue-500" />,
          description: "Strategic tasks that contribute to long-term goals",
        }
      case "q3":
        return {
          label: "Q3: Urgent, Not Important",
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          description: "Tasks that feel urgent but don't contribute to your goals",
        }
      case "q4":
        return {
          label: "Q4: Not Important or Urgent",
          icon: <ListTodo className="h-4 w-4 text-gray-500" />,
          description: "Low-value activities that can be eliminated",
        }
      default:
        return {
          label: "Q2: Important, Not Urgent",
          icon: <Compass className="h-4 w-4 text-blue-500" />,
          description: "Strategic tasks that contribute to long-term goals",
        }
    }
  }

  const quadrantInfo = getQuadrantInfo(task.quadrant)

  return (
    <>
      <Card
        ref={drag}
        className={`p-3 ${
          task.completed ? "bg-green-50 border-green-500 dark:bg-green-900/20" : "bg-card"
        } transition-colors ${isDragging ? "opacity-50" : ""} cursor-move hover:shadow-md`}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete(task.id)
            }}
            className={`mt-1 flex-shrink-0 ${task.completed ? "text-green-500" : "text-gray-400 hover:text-gray-600"}`}
          >
            {task.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3
                className={`font-medium ${
                  task.completed
                    ? "line-through text-green-700 dark:text-green-400"
                    : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>

              {task.completed && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}

              {/* Only show badges if not compact or if expanded */}
              {(!compact || expanded) && (
                <>
                  <Badge variant="outline" className={getQuadrantColor(task.quadrant)}>
                    {task.quadrant.toUpperCase()}
                  </Badge>

                  {task.priority && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                    >
                      {task.priority}
                    </Badge>
                  )}

                  {role && (
                    <Badge variant="outline" style={{ backgroundColor: `${role.color}20`, borderColor: role.color }}>
                      {role.name}
                    </Badge>
                  )}

                  {task.status && (
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {getStatusIcon(task.status)}
                      {task.status === "to-do" ? "To Do" : task.status === "in-progress" ? "In Progress" : "Done"}
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

                  {task.isRitual && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Ritual
                    </Badge>
                  )}

                  {task.frequency && task.frequency !== "one-time" && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {getFrequencyLabel(task.frequency)}
                    </Badge>
                  )}

                  {task.pomodoroRequired && (
                    <Badge variant="outline" className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                      <Timer className="h-3 w-3 mr-1" />
                      Pomodoro
                    </Badge>
                  )}
                </>
              )}

              {/* Show expand/collapse button if compact */}
              {compact && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto p-0 h-6 w-6"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>

            {/* Description - only show if expanded or not compact */}
            {(!compact || expanded) && task.description && (
              <p className={`text-sm ${task.completed ? "text-muted-foreground/70" : "text-muted-foreground"} mb-2`}>
                {task.description}
              </p>
            )}

            {/* Links - only show if expanded or not compact */}
            {(!compact || expanded) && task.links && (
              <div className="mt-2 mb-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Link2 className="h-3 w-3" />
                  <span>Links:</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  {task.links.split(/[\n,]/).map((link, index) => {
                    const trimmedLink = link.trim()
                    if (!trimmedLink) return null

                    // Check if it's a valid URL
                    let url = trimmedLink
                    if (!/^https?:\/\//i.test(url)) {
                      url = `https://${url}`
                    }

                    return (
                      <div key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {trimmedLink}
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Subtasks section */}
            {showSubtasks && (
              <div className="mt-4 mb-2 border-t pt-2">
                <SubtaskManager
                  subtasks={task.subtasks || []}
                  onChange={handleSubtasksChange}
                  taskId={task.id}
                  userId={task.userId}
                />
              </div>
            )}

            {/* Existing subtasks display */}
            {(!compact || expanded) && task.subtasks && task.subtasks.length > 0 && !showSubtasks && (
              <div className="mt-2 space-y-1">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => {
                        const updatedTask = {
                          ...task,
                          subtasks: task.subtasks.map((st) =>
                            st.id === subtask.id ? { ...st, completed: !subtask.completed } : st,
                          ),
                        }
                        onUpdate(updatedTask)
                      }}
                      className="h-3 w-3"
                    />
                    <span className={`text-xs ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time spent - only show if expanded or not compact */}
          {(!compact || expanded) && task.timeSpent > 0 && (
            <div className="flex items-center text-xs text-muted-foreground mr-2">
              <Clock className="h-3 w-3 mr-1" />
              {Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m
            </div>
          )}

          {(!compact || expanded) && onMoveUp && onMoveDown && (
            <div className="flex flex-col mr-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveUp(task.id)
                }}
                disabled={isFirst}
              >
                <ArrowUp className="h-3 w-3" />
                <span className="sr-only">Move Up</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveDown(task.id)
                }}
                disabled={isLast}
              >
                <ArrowDown className="h-3 w-3" />
                <span className="sr-only">Move Down</span>
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowTimer(!showTimer)}>
                <Timer className="h-4 w-4 mr-2" />
                {showTimer ? "Hide Timer" : "Show Timer"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSubtasks(!showSubtasks)}>
                <ListPlus className="h-4 w-4 mr-2" />
                {showSubtasks ? "Hide Subtasks" : "Manage Subtasks"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Always show the timer button for better visibility */}
        {!showTimer && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTimer(true)} 
            className="mt-2 w-full"
          >
            <Timer className="h-4 w-4 mr-2" />
            Start Pomodoro Timer
          </Button>
        )}
        
        {showTimer && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Pomodoro Timer</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTimer(false)} 
                className="h-6 w-6 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <MiniPomodoro
              taskId={task.id}
              onComplete={(taskId, duration) => {
                if (onUpdateTimeSpent) {
                  onUpdateTimeSpent(taskId, duration)
                }
              }}
            />
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Input
                placeholder="Task title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg font-medium"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Quadrant</label>
                    <Select value={editQuadrant} onValueChange={setEditQuadrant}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="q1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            <span>Q1: Urgent & Important</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="q2">
                          <div className="flex items-center gap-2">
                            <Compass className="h-4 w-4 text-blue-500" />
                            <span>Q2: Important, Not Urgent</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="q3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span>Q3: Urgent, Not Important</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="q4">
                          <div className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4 text-gray-500" />
                            <span>Q4: Not Important or Urgent</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Priority</label>
                    <Select value={editPriority} onValueChange={setEditPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Set priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="A1">A1 (Highest)</SelectItem>
                        <SelectItem value="A2">A2</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="B1">B1</SelectItem>
                        <SelectItem value="B2">B2</SelectItem>
                        <SelectItem value="B3">B3</SelectItem>
                        <SelectItem value="C1">C1</SelectItem>
                        <SelectItem value="C2">C2</SelectItem>
                        <SelectItem value="C3">C3 (Lowest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Role</label>
                  <Select value={editRoleId} onValueChange={setEditRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to-do">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-big-rock"
                      checked={editIsBigRock}
                      onChange={(e) => setEditIsBigRock(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="edit-big-rock" className="text-sm font-medium flex items-center gap-1">
                      <Target className="h-4 w-4 text-primary" />
                      Mark as a Big Rock (high-priority Q2 goal)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-pomodoro"
                      checked={editPomodoroRequired}
                      onChange={(e) => setEditPomodoroRequired(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="edit-pomodoro" className="text-sm font-medium flex items-center gap-1">
                      <Timer
                      className="text-sm font-medium flex items-center gap-1">
                      <Timer className="h-4 w-4 text-red-500" />
                      Pomodoro Required
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scheduling" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Start Date</label>
                    <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editStartDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editStartDate ? format(editStartDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-2 border-b flex justify-between items-center">
                          <span className="text-sm font-medium">Select start date</span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditStartDate(new Date())
                                setStartDatePickerOpen(false)
                              }}
                              className="h-7 px-2"
                            >
                              Today
                            </Button>
                            {editStartDate && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditStartDate(undefined)
                                  setStartDatePickerOpen(false)
                                }}
                                className="h-7 px-2"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </div>
                        <Calendar
                          mode="single"
                          selected={editStartDate}
                          onSelect={(date) => {
                            setEditStartDate(date)
                            setStartDatePickerOpen(false)
                          }}
                          initialFocus
                          className="border-0"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Due Date</label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editDueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editDueDate ? format(editDueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-2 border-b flex justify-between items-center">
                          <span className="text-sm font-medium">Select due date</span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditDueDate(new Date())
                                setDatePickerOpen(false)
                              }}
                              className="h-7 px-2"
                            >
                              Today
                            </Button>
                            {editDueDate && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditDueDate(undefined)
                                  setDatePickerOpen(false)
                                }}
                                className="h-7 px-2"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </div>
                        <Calendar
                          mode="single"
                          selected={editDueDate}
                          onSelect={(date) => {
                            setEditDueDate(date)
                            setDatePickerOpen(false)
                          }}
                          initialFocus
                          className="border-0"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Frequency</label>
                  <Select value={editFrequency} onValueChange={setEditFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-ritual"
                    checked={editIsRitual}
                    onChange={(e) => setEditIsRitual(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="edit-ritual" className="text-sm font-medium flex items-center gap-1">
                    <RotateCcw className="h-4 w-4 text-blue-500" />
                    Mark as a Ritual (recurring habit)
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    placeholder="Add details about this task"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                    <Link2 className="h-4 w-4" />
                    Links / References
                  </label>
                  <Textarea
                    placeholder="Add links to relevant resources (Notion, Google Docs, etc.)"
                    value={editLinks}
                    onChange={(e) => setEditLinks(e.target.value)}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Add one link per line or separate with commas</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSubmitting || !editTitle.trim()}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>Are you sure you want to delete this task?</p>
            <p className="font-medium mt-2">{task.title}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(task.id)
                setConfirmDeleteOpen(false)
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
}

