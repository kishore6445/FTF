 "use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Edit,
  Trash2,
  Clock,
  Filter,
  Plus,
  X,
  Calendar,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  CalendarClock,
  CalendarRange,
  CalendarCheck,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, isBefore, isAfter } from "date-fns"
import type { Task, Role, Goal } from "@/lib/types"

// Add the import for the EditTaskDialog component
import EditTaskDialog from "@/components/edit-task-dialog"

interface TaskInboxProps {
  tasks: Task[]
  roles: Role[]
  goals: Goal[]
  toggleTaskCompletion: (taskId: string) => void
  deleteTask: (taskId: string) => void
  updateTask: (task: Task) => void
}

export default function TaskInbox({
  tasks,
  roles,
  goals,
  toggleTaskCompletion,
  deleteTask,
  updateTask,
}: TaskInboxProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterQuadrant, setFilterQuadrant] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newSubtask, setNewSubtask] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // Toggle section collapse
  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Check if section is collapsed
  const isSectionCollapsed = (section: string) => {
    return !!collapsedSections[section]
  }

  // Filter and categorize tasks
  const categorizedTasks = useMemo(() => {
    // First apply filters
    const filtered = tasks.filter((task) => {
      // Search query filter
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(task.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Role filter
      if (filterRole !== "all" && task.roleId !== filterRole) {
        return false
      }

      // Quadrant filter
      if (filterQuadrant !== "all" && task.quadrant !== filterQuadrant) {
        return false
      }

      // Status filter
      if (filterStatus === "completed" && !task.completed) {
        return false
      }
      if (filterStatus === "active" && task.completed) {
        return false
      }

      // Tab filters
      if (activeTab === "today") {
        if (task.dueDate) {
          return isToday(new Date(task.dueDate))
        }
        return false
      } else if (activeTab === "upcoming") {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          return isAfter(dueDate, new Date()) && !isToday(dueDate)
        }
        return false
      } else if (activeTab === "weekly") {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          return isThisWeek(dueDate) && !isToday(dueDate)
        }
        return task.recurrencePattern?.frequency === "weekly"
      } else if (activeTab === "monthly") {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          return isThisMonth(dueDate) && !isThisWeek(dueDate)
        }
        return task.recurrencePattern?.frequency === "monthly"
      }

      return true
    })

    // Then categorize
    const result = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      upcoming: [] as Task[],
      recurring: [] as Task[],
      completed: [] as Task[],
      noDate: [] as Task[],
    }

    const now = new Date()

    filtered.forEach((task) => {
      if (task.completed) {
        result.completed.push(task)
        return
      }

      if (task.recurrencePattern) {
        result.recurring.push(task)
        return
      }

      if (!task.dueDate) {
        result.noDate.push(task)
        return
      }

      const dueDate = new Date(task.dueDate)

      if (isBefore(dueDate, now) && !isToday(dueDate)) {
        result.overdue.push(task)
      } else if (isToday(dueDate)) {
        result.today.push(task)
      } else if (isTomorrow(dueDate)) {
        result.tomorrow.push(task)
      } else if (isThisWeek(dueDate)) {
        result.thisWeek.push(task)
      } else {
        result.upcoming.push(task)
      }
    })

    // Sort each category
    const sortByQuadrant = (a: Task, b: Task) => {
      const quadrantPriority: Record<string, number> = { q1: 0, q2: 1, q3: 2, q4: 3 }
      return quadrantPriority[a.quadrant] - quadrantPriority[b.quadrant]
    }

    Object.keys(result).forEach((key) => {
      ;(result as any)[key].sort(sortByQuadrant)
    })

    return result
  }, [tasks, searchQuery, filterRole, filterQuadrant, filterStatus, activeTab])

  const handleAddSubtask = () => {
    if (!editingTask || !newSubtask.trim()) return

    const updatedTask = {
      ...editingTask,
      subtasks: [
        ...editingTask.subtasks,
        {
          id: uuidv4(),
          title: newSubtask,
          completed: false,
          taskId: editingTask.id,
          userId: editingTask.userId,
        },
      ],
    }

    setEditingTask(updatedTask)
    setNewSubtask("")
  }

  const handleRemoveSubtask = (subtaskId: string) => {
    if (!editingTask) return

    setEditingTask({
      ...editingTask,
      subtasks: editingTask.subtasks.filter((subtask) => subtask.id !== subtaskId),
    })
  }

  const handleToggleSubtask = (subtaskId: string) => {
    if (!editingTask) return

    setEditingTask({
      ...editingTask,
      subtasks: editingTask.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
      ),
    })
  }

  const handleSaveTask = () => {
    if (editingTask) {
      updateTask(editingTask)
      setEditingTask(null)
    }
  }

  const renderTaskItem = (task: Task) => {
    const role = roles.find((r) => r.id === task.roleId)

    return (
      <div
        key={task.id}
        className={`p-4 border rounded-lg ${task.completed ? "bg-muted/50" : "bg-card"} transition-colors`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTaskCompletion(task.id)}
            className={`mt-1 ${task.completed ? "bg-green-500 border-green-500" : ""}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </h3>
              {role && (
                <Badge variant="outline" style={{ backgroundColor: `${role.color}20`, borderColor: role.color }}>
                  {role.name}
                </Badge>
              )}
              {task.dueDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </Badge>
              )}
              {task.recurrencePattern && (
                <Badge variant="outline" className="text-xs bg-blue-50">
                  <CalendarClock className="h-3 w-3 mr-1" />
                  {task.recurrencePattern.frequency.charAt(0).toUpperCase() + task.recurrencePattern.frequency.slice(1)}
                </Badge>
              )}
            </div>
            {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
            {task.subtasks.length > 0 && (
              <div className="mt-2 space-y-1">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => {
                        const updatedTask = {
                          ...task,
                          subtasks: task.subtasks.map((st) =>
                            st.id === subtask.id ? { ...st, completed: !st.completed } : st,
                          ),
                        }
                        updateTask(updatedTask)
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
          <div className="flex items-center gap-1 shrink-0">
            {task.timeSpent > 0 && (
              <div className="flex items-center text-xs text-muted-foreground mr-2">
                <Clock className="h-3 w-3 mr-1" />
                {Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTask({ ...task })}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderTaskSection = (title: string, tasks: Task[], icon: React.ReactNode, badgeColor: string) => {
    if (tasks.length === 0) {
      return null
    }

    const sectionKey = title.toLowerCase().replace(/\s+/g, "-")
    const isCollapsed = isSectionCollapsed(sectionKey)

    return (
      <div className="mb-4">
        <div
          className="flex items-center justify-between py-2 px-3 bg-muted rounded-md cursor-pointer"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="font-semibold">{title}</h4>
            <Badge variant="secondary" className={badgeColor}>
              {tasks.length}
            </Badge>
          </div>
          <Button variant="ghost" size="icon">
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        {!isCollapsed && <div className="space-y-2 mt-2">{tasks.map((task) => renderTaskItem(task))}</div>}
      </div>
    )
  }

  const SubtaskManager = ({ task, updateTask }: { task: Task; updateTask: (task: Task) => void }) => {
    const [newSubtask, setNewSubtask] = useState("")

    const handleAddSubtask = () => {
      if (!task || !newSubtask.trim()) return

      const updatedTask = {
        ...task,
        subtasks: [
          ...task.subtasks,
          {
            id: uuidv4(),
            title: newSubtask,
            completed: false,
            taskId: task.id,
            userId: task.userId,
          },
        ],
      }

      updateTask(updatedTask)
      setNewSubtask("")
    }

    const handleRemoveSubtask = (subtaskId: string) => {
      if (!task) return

      const updatedTask = {
        ...task,
        subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
      }
      updateTask(updatedTask)
    }

    const handleToggleSubtask = (subtaskId: string) => {
      if (!task) return

      const updatedTask = {
        ...task,
        subtasks: task.subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
        ),
      }
      updateTask(updatedTask)
    }

    return (
      <div className="space-y-2">
        <Label>Subtasks</Label>
        <div className="space-y-2">
          {task.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <Checkbox checked={subtask.completed} onCheckedChange={() => handleToggleSubtask(subtask.id)} />
              <span className="text-sm flex-1">{subtask.title}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveSubtask(subtask.id)}>
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a subtask"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddSubtask()
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={handleAddSubtask}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Task Inbox</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="filter-role">Filter by Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger id="filter-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-quadrant">Filter by Quadrant</Label>
                <Select value={filterQuadrant} onValueChange={setFilterQuadrant}>
                  <SelectTrigger id="filter-quadrant">
                    <SelectValue placeholder="Select quadrant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quadrants</SelectItem>
                    <SelectItem value="q1">Q1: Urgent & Important</SelectItem>
                    <SelectItem value="q2">Q2: Not Urgent & Important</SelectItem>
                    <SelectItem value="q3">Q3: Urgent & Not Important</SelectItem>
                    <SelectItem value="q4">Q4: Not Urgent & Not Important</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-status">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filter-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <CalendarRange className="h-4 w-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="today" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Today</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Upcoming</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-1">
                <CalendarCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Weekly</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-1">
                <CalendarClock className="h-4 w-4" />
                <span className="hidden sm:inline">Monthly</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {Object.values(categorizedTasks).every((arr) => arr.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No tasks found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div>
              {renderTaskSection(
                "Overdue",
                categorizedTasks.overdue,
                <Clock className="h-5 w-5 text-red-600" />,
                "bg-red-50 text-red-800",
              )}

              {renderTaskSection(
                "Today",
                categorizedTasks.today,
                <Calendar className="h-5 w-5 text-blue-600" />,
                "bg-blue-50 text-blue-800",
              )}

              {renderTaskSection(
                "Tomorrow",
                categorizedTasks.tomorrow,
                <CalendarDays className="h-5 w-5 text-indigo-600" />,
                "bg-indigo-50 text-indigo-800",
              )}

              {renderTaskSection(
                "This Week",
                categorizedTasks.thisWeek,
                <CalendarRange className="h-5 w-5 text-purple-600" />,
                "bg-purple-50 text-purple-800",
              )}

              {renderTaskSection(
                "Upcoming",
                categorizedTasks.upcoming,
                <CalendarClock className="h-5 w-5 text-orange-600" />,
                "bg-orange-50 text-orange-800",
              )}

              {renderTaskSection(
                "Recurring",
                categorizedTasks.recurring,
                <CalendarCheck className="h-5 w-5 text-green-600" />,
                "bg-green-50 text-green-800",
              )}

              {renderTaskSection(
                "No Due Date",
                categorizedTasks.noDate,
                <Circle className="h-5 w-5 text-gray-600" />,
                "bg-gray-50 text-gray-800",
              )}

              {renderTaskSection(
                "Completed",
                categorizedTasks.completed,
                <CheckCircle2 className="h-5 w-5 text-green-600" />,
                "bg-green-50 text-green-800",
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        roles={roles}
        updateTask={updateTask}
        setEditingTask={setEditingTask}
      />
    </div>
  )
}

