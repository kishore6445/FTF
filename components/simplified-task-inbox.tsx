"use client"
export const dynamic = "force-dynamic";

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Star,
  StarOff,
  ChevronDown,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import type { Task, Role } from "@/lib/types"

interface SimplifiedTaskInboxProps {
  tasks: Task[]
  roles: Role[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string) => void
  onToggleSubtaskCompletion: (taskId: string, subtaskId: string) => void
}

export default function SimplifiedTaskInbox({
  tasks,
  roles,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
  onToggleSubtaskCompletion,
}: SimplifiedTaskInboxProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("priority")
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [starredTasks, setStarredTasks] = useState<Record<string, boolean>>({})

  // Initialize starred tasks from localStorage
  useEffect(() => {
    const savedStarred = localStorage.getItem("starredTasks")
    if (savedStarred) {
      setStarredTasks(JSON.parse(savedStarred))
    }
  }, [])

  // Save starred tasks to localStorage
  useEffect(() => {
    localStorage.setItem("starredTasks", JSON.stringify(starredTasks))
  }, [starredTasks])

  // Filter tasks based on search term and active tab
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "completed") return matchesSearch && task.completed
    if (activeTab === "pending") return matchesSearch && !task.completed
    if (activeTab === "starred") return matchesSearch && starredTasks[task.id]

    // Filter by quadrant
    return matchesSearch && task.quadrant === activeTab
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      // Sort by quadrant priority (Q1 > Q2 > Q3 > Q4)
      const quadrantPriority = { q1: 1, q2: 2, q3: 3, q4: 4 }
      return (
        quadrantPriority[a.quadrant as keyof typeof quadrantPriority] -
        quadrantPriority[b.quadrant as keyof typeof quadrantPriority]
      )
    }
    if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title)
    }
    if (sortBy === "date") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return 0
  })

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  // Toggle task starred status
  const toggleStarredTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  // Get quadrant display info
  const getQuadrantInfo = (quadrant: string) => {
    switch (quadrant) {
      case "q1":
        return { name: "Urgent & Important", color: "bg-red-500", textColor: "text-red-500", lightBg: "bg-red-50" }
      case "q2":
        return {
          name: "Important, Not Urgent",
          color: "bg-blue-500",
          textColor: "text-blue-500",
          lightBg: "bg-blue-50",
        }
      case "q3":
        return {
          name: "Urgent, Not Important",
          color: "bg-amber-500",
          textColor: "text-amber-500",
          lightBg: "bg-amber-50",
        }
      case "q4":
        return {
          name: "Not Urgent or Important",
          color: "bg-gray-500",
          textColor: "text-gray-500",
          lightBg: "bg-gray-50",
        }
      default:
        return { name: "Unknown", color: "bg-gray-500", textColor: "text-gray-500", lightBg: "bg-gray-50" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with animated gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-lg">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Task Inbox</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Organize and prioritize your tasks based on Stephen Covey's time management quadrants. Focus on what truly
            matters.
          </p>
        </motion.div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Sort: {sortBy === "priority" ? "Priority" : sortBy === "alphabetical" ? "A-Z" : "Date"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("priority")}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Alphabetical
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date")}>
                <Clock className="h-4 w-4 mr-2" />
                Date Created
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onAddTask} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="starred" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Starred
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="q1"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm hidden md:block"
          >
            Q1
          </TabsTrigger>
          <TabsTrigger
            value="q2"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm hidden md:block"
          >
            Q2
          </TabsTrigger>
          <TabsTrigger
            value="q3"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm hidden md:block"
          >
            Q3
          </TabsTrigger>
          <TabsTrigger
            value="q4"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm hidden md:block"
          >
            Q4
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {sortedTasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 px-4">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm ? "No tasks match your search criteria." : "Get started by adding your first task."}
              </p>
              <Button onClick={onAddTask} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Task
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {sortedTasks.map((task) => {
                  const quadrantInfo = getQuadrantInfo(task.quadrant)
                  const isExpanded = expandedTasks[task.id]
                  const isStarred = starredTasks[task.id]

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <Card
                        className={`overflow-hidden border-l-4 ${
                          task.completed ? "border-l-green-500 bg-green-50/50 dark:bg-green-900/20" : quadrantInfo.color
                        } hover:shadow-md transition-all duration-200`}
                      >
                        <CardContent className="p-0">
                          <div className="p-4 cursor-pointer" onClick={() => toggleTaskExpansion(task.id)}>
                            <div className="flex items-start gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleTaskCompletion(task.id)
                                }}
                                className={`mt-1 flex-shrink-0 ${task.completed ? "text-green-500" : "text-gray-400 hover:text-gray-600"}`}
                              >
                                {task.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
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
                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      onClick={(e) => toggleStarredTask(task.id, e)}
                                      className={`${isStarred ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                                    >
                                      {isStarred ? (
                                        <Star className="h-5 w-5 fill-amber-500" />
                                      ) : (
                                        <StarOff className="h-5 w-5" />
                                      )}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onEditTask(task)
                                      }}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteTask(task.id)
                                      }}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge
                                    variant="outline"
                                    className={`${quadrantInfo.lightBg} ${quadrantInfo.textColor} border-0`}
                                  >
                                    {quadrantInfo.name}
                                  </Badge>

                                  {task.role_id && (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-0">
                                      {roles.find((r) => r.id === task.role_id)?.name || "Unknown Role"}
                                    </Badge>
                                  )}

                                  {task.due_date && (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-0">
                                      Due: {new Date(task.due_date).toLocaleDateString()}
                                    </Badge>
                                  )}
                                </div>

                                {task.description && !isExpanded && (
                                  <p className="text-gray-500 text-sm mt-2 line-clamp-1">{task.description}</p>
                                )}

                                <div className="flex items-center mt-2 text-gray-500 text-xs">
                                  <ChevronDown
                                    className={`h-4 w-4 mr-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                  {isExpanded ? "Show less" : "Show more"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Separator />
                              <div className="p-4 bg-gray-50">
                                {task.description && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                                    <p className="text-gray-600">{task.description}</p>
                                  </div>
                                )}

                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Subtasks</h4>
                                    <ul className="space-y-2">
                                      {task.subtasks.map((subtask) => (
                                        <li key={subtask.id} className="flex items-start gap-3">
                                          <button
                                            onClick={() => onToggleSubtaskCompletion(task.id, subtask.id)}
                                            className={`mt-0.5 ${subtask.completed ? "text-green-500" : "text-gray-400 hover:text-gray-600"}`}
                                          >
                                            {subtask.completed ? (
                                              <CheckCircle className="h-4 w-4" />
                                            ) : (
                                              <Circle className="h-4 w-4" />
                                            )}
                                          </button>
                                          <span
                                            className={`text-sm ${subtask.completed ? "line-through text-gray-500" : "text-gray-700"}`}
                                          >
                                            {subtask.title}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                  <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                                  {task.time_spent > 0 && (
                                    <span>
                                      Time spent: {Math.floor(task.time_spent / 60)}m {task.time_spent % 60}s
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

