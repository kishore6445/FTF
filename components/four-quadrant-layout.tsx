"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Grid,
  ListTodo,
  Calendar,
  Target,
  Compass,
  ArrowRight,
  Plus,
  Sparkles,
  BarChart3,
  Zap,
  Lightbulb,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import type { Task, Role } from "@/lib/types"
import Link from "next/link"

interface FourQuadrantLayoutProps {
  tasks: Task[]
  roles: Role[]
  onAddTask: (quadrant: string) => void
  onViewAllTasks: () => void
  onViewWeeklyPlan: () => void
  onViewMissionVision: () => void
}

export default function FourQuadrantLayout({
  tasks,
  roles,
  onAddTask,
  onViewAllTasks,
  onViewWeeklyPlan,
  onViewMissionVision,
}: FourQuadrantLayoutProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [completionStats, setCompletionStats] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    total: 0,
  })

  // Calculate completion stats
  useEffect(() => {
    const stats = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      total: 0,
    }

    const quadrantTasks = {
      q1: tasks.filter((t) => t.quadrant === "q1"),
      q2: tasks.filter((t) => t.quadrant === "q2"),
      q3: tasks.filter((t) => t.quadrant === "q3"),
      q4: tasks.filter((t) => t.quadrant === "q4"),
    }

    stats.q1 = (quadrantTasks.q1.filter((t) => t.completed).length / (quadrantTasks.q1.length || 1)) * 100
    stats.q2 = (quadrantTasks.q2.filter((t) => t.completed).length / (quadrantTasks.q2.length || 1)) * 100
    stats.q3 = (quadrantTasks.q3.filter((t) => t.completed).length / (quadrantTasks.q3.length || 1)) * 100
    stats.q4 = (quadrantTasks.q4.filter((t) => t.completed).length / (quadrantTasks.q4.length || 1)) * 100
    stats.total = (tasks.filter((t) => t.completed).length / (tasks.length || 1)) * 100

    setCompletionStats(stats)
  }, [tasks])

  // Get tasks for each quadrant
  const q1Tasks = tasks.filter((t) => t.quadrant === "q1" && !t.completed).slice(0, 3)
  const q2Tasks = tasks.filter((t) => t.quadrant === "q2" && !t.completed).slice(0, 3)
  const q3Tasks = tasks.filter((t) => t.quadrant === "q3" && !t.completed).slice(0, 3)
  const q4Tasks = tasks.filter((t) => t.quadrant === "q4" && !t.completed).slice(0, 3)

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = tasks
    .filter((t) => {
      if (!t.dueDate || t.completed) return false
      const dueDate = new Date(t.dueDate)
      const now = new Date()
      const sevenDaysLater = new Date()
      sevenDaysLater.setDate(now.getDate() + 7)
      return dueDate > now && dueDate <= sevenDaysLater
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header with animated gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-lg">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-6 w-6" />
                <h1 className="text-3xl font-bold">FirstThings Dashboard</h1>
              </div>
              <p className="text-white/80 max-w-xl">
                Focus on what truly matters. Organize your tasks based on importance and urgency.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={onViewAllTasks}
              >
                <ListTodo className="h-4 w-4 mr-2" />
                Task Inbox
              </Button>
              <Link href="/planner" passHref>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Calendar className="h-4 w-4 mr-2" />
                  Weekly Plan
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={onViewMissionVision}
              >
                <Compass className="h-4 w-4 mr-2" />
                Mission & Vision
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard_here</span>
          </TabsTrigger>
          <TabsTrigger value="quadrants" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">Quadrants_here</span>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Upcoming_here</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quadrant Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuadrantCard
              title="Q1: Urgent & Important"
              description="Critical activities that require immediate attention"
              tasks={q1Tasks}
              color="from-red-500 to-red-600"
              icon={<Zap className="h-5 w-5" />}
              progress={completionStats.q1}
              onAddTask={() => onAddTask("q1")}
              onViewAll={onViewAllTasks}
            />

            <QuadrantCard
              title="Q2: Important, Not Urgent"
              description="Strategic activities that contribute to long-term goals"
              tasks={q2Tasks}
              color="from-blue-500 to-blue-600"
              icon={<Target className="h-5 w-5" />}
              progress={completionStats.q2}
              onAddTask={() => onAddTask("q2")}
              onViewAll={onViewAllTasks}
            />

            <QuadrantCard
              title="Q3: Urgent, Not Important"
              description="Interruptions and pressing matters with little value"
              tasks={q3Tasks}
              color="from-amber-500 to-amber-600"
              icon={<Calendar className="h-5 w-5" />}
              progress={completionStats.q3}
              onAddTask={() => onAddTask("q3")}
              onViewAll={onViewAllTasks}
            />

            <QuadrantCard
              title="Q4: Not Important or Urgent"
              description="Time-wasting activities with little or no value"
              tasks={q4Tasks}
              color="from-gray-500 to-gray-600"
              icon={<ListTodo className="h-5 w-5" />}
              progress={completionStats.q4}
              onAddTask={() => onAddTask("q4")}
              onViewAll={onViewAllTasks}
            />
          </div>

          {/* Weekly Plan */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    Weekly Plan
                  </CardTitle>
                  <Link href="/planner" passHref>
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      View Plan
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium">This Week's Focus</div>
                    <div className="text-gray-500">
                      {format(new Date(), "MMM d")} -{" "}
                      {format(new Date(new Date().setDate(new Date().getDate() + 6)), "MMM d")}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Q1 Tasks</span>
                        <span className="text-gray-500">{Math.round(completionStats.q1)}%</span>
                      </div>
                      <Progress value={completionStats.q1} className="h-2" indicatorClassName="bg-red-500" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Q2 Tasks</span>
                        <span className="text-gray-500">{Math.round(completionStats.q2)}%</span>
                      </div>
                      <Progress value={completionStats.q2} className="h-2" indicatorClassName="bg-blue-500" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Q3 Tasks</span>
                        <span className="text-gray-500">{Math.round(completionStats.q3)}%</span>
                      </div>
                      <Progress value={completionStats.q3} className="h-2" indicatorClassName="bg-amber-500" />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Q4 Tasks</span>
                        <span className="text-gray-500">{Math.round(completionStats.q4)}%</span>
                      </div>
                      <Progress value={completionStats.q4} className="h-2" indicatorClassName="bg-gray-500" />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Overall Progress</div>
                      <div className="text-lg font-bold text-indigo-600">{Math.round(completionStats.total)}%</div>
                    </div>
                    <Progress value={completionStats.total} className="h-3 mt-2" indicatorClassName="bg-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission & Vision */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Compass className="h-5 w-5 text-indigo-500" />
                  Mission & Vision
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onViewMissionVision} className="text-xs h-8">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Mission Statement</h3>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    "To live a life of purpose and meaning, contributing positively to the world around me while
                    maintaining balance and continuous growth."
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={onViewMissionVision}>
                    Edit Mission
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Vision Statement</h3>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    "I see myself as a leader who inspires others, maintains a healthy work-life balance, and continues
                    to grow personally and professionally."
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={onViewMissionVision}>
                    Edit Vision
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-white/50 rounded-b-lg">
              <div className="text-xs text-gray-500 italic w-full text-center">
                "The key is not to prioritize what's on your schedule, but to schedule your priorities." — Stephen Covey
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="quadrants">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuadrantDetailCard
              title="Q1: Urgent & Important"
              description="Crisis, pressing problems, deadline-driven projects"
              info="Focus on these tasks first. They are critical and need immediate attention."
              tasks={tasks.filter((t) => t.quadrant === "q1" && !t.completed)}
              color="bg-red-500"
              lightColor="bg-red-50"
              textColor="text-red-700"
              onAddTask={() => onAddTask("q1")}
            />

            <QuadrantDetailCard
              title="Q2: Important, Not Urgent"
              description="Planning, prevention, relationship building, true recreation"
              info="These tasks build your future. Schedule time for them to avoid them becoming urgent."
              tasks={tasks.filter((t) => t.quadrant === "q2" && !t.completed)}
              color="bg-blue-500"
              lightColor="bg-blue-50"
              textColor="text-blue-700"
              onAddTask={() => onAddTask("q2")}
            />

            <QuadrantDetailCard
              title="Q3: Urgent, Not Important"
              description="Interruptions, some calls, some meetings, many pressing matters"
              info="Try to delegate or minimize these tasks. They create a false sense of importance."
              tasks={tasks.filter((t) => t.quadrant === "q3" && !t.completed)}
              color="bg-amber-500"
              lightColor="bg-amber-50"
              textColor="text-amber-700"
              onAddTask={() => onAddTask("q3")}
            />

            <QuadrantDetailCard
              title="Q4: Not Important or Urgent"
              description="Trivia, busy work, time wasters, pleasant activities"
              info="Eliminate these tasks when possible. They drain your time and energy."
              tasks={tasks.filter((t) => t.quadrant === "q4" && !t.completed)}
              color="bg-gray-500"
              lightColor="bg-gray-50"
              textColor="text-gray-700"
              onAddTask={() => onAddTask("q4")}
            />
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Upcoming Tasks - Next 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <li key={task.id} className="flex items-start gap-3 p-3 rounded-md border hover:bg-gray-50">
                      <div className={`w-2 h-full rounded-full ${getQuadrantColor(task.quadrant)}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{task.title}</div>
                        {task.description && <div className="text-sm text-gray-500 mt-1">{task.description}</div>}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${getQuadrantTextColor(task.quadrant)}`}>
                            {task.quadrant === "q1"
                              ? "Q1"
                              : task.quadrant === "q2"
                                ? "Q2"
                                : task.quadrant === "q3"
                                  ? "Q3"
                                  : task.quadrant === "q4"
                                    ? "Q4"
                                    : task.quadrant.toUpperCase()}
                          </Badge>

                          {task.dueDate && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                              Due: {format(new Date(task.dueDate), "MMM d")}
                            </Badge>
                          )}

                          {task.roleId && (
                            <Badge variant="outline" className="text-xs bg-gray-50">
                              {roles.find((r) => r.id === task.roleId)?.name || "Unknown Role"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No upcoming tasks</p>
                  <p className="text-sm mb-4">Plan ahead by adding tasks for the coming days</p>
                  <Button onClick={() => onAddTask("q2")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Upcoming Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper components
interface QuadrantCardProps {
  title: string
  description: string
  tasks: Task[]
  color: string
  icon: React.ReactNode
  progress: number
  onAddTask: () => void
  onViewAll: () => void
}

function QuadrantCard({ title, description, tasks, color, icon, progress, onAddTask, onViewAll }: QuadrantCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className={`bg-gradient-to-r ${color} p-4 text-white`}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold">{title}</h3>
          {icon}
        </div>
        <p className="text-xs text-white/80">{description}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="text-xs">Progress</div>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-xs font-medium">{Math.round(progress)}%</div>
        </div>
      </div>

      <CardContent className="p-4">
        {tasks.length > 0 ? (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="text-sm truncate py-1 border-b border-gray-100 last:border-0">
                {task.title}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            <p>No active tasks</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={onAddTask}>
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={onViewAll}>
          View All_ABC
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

interface QuadrantDetailCardProps {
  title: string
  description: string
  info: string
  tasks: Task[]
  color: string
  lightColor: string
  textColor: string
  onAddTask: () => void
}

function QuadrantDetailCard({
  title,
  description,
  info,
  tasks,
  color,
  lightColor,
  textColor,
  onAddTask,
}: QuadrantDetailCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className={`${color} p-4 text-white`}>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-white/90">{description}</p>
      </div>

      <CardContent className="p-4">
        <div className={`${lightColor} ${textColor} p-3 rounded-md text-sm mb-4`}>
          <p>{info}</p>
        </div>

        {tasks.length > 0 ? (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {tasks.map((task) => (
              <li key={task.id} className="text-sm p-2 border-b border-gray-100 last:border-0">
                <div className="font-medium">{task.title}</div>
                {task.description && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            <p>No active tasks in this quadrant</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={onAddTask} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Task to {title}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Helper functions
function getQuadrantColor(quadrant: string) {
  switch (quadrant) {
    case "q1":
      return "bg-red-500"
    case "q2":
      return "bg-blue-500"
    case "q3":
      return "bg-amber-500"
    case "q4":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

function getQuadrantTextColor(quadrant: string) {
  switch (quadrant) {
    case "q1":
      return "text-red-700 bg-red-50"
    case "q2":
      return "text-blue-700 bg-blue-50"
    case "q3":
      return "text-amber-700 bg-amber-50"
    case "q4":
      return "text-gray-700 bg-gray-50"
    default:
      return "text-gray-700 bg-gray-50"
  }
}

