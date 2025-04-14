"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { PlusCircle, CheckCircle, Clock, Calendar, Target, Grid2X2, ListTodo, Sparkles, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import type { Task, Role } from "@/lib/types"
import DailyRitualStreak from "@/components/daily-ritual-streak"

interface SimplifiedDashboardProps {
  tasks: Task[]
  roles: Role[]
  completedToday: number
  totalToday: number
  bigRocks: Task[]
}

export default function SimplifiedDashboard({
  tasks,
  roles,
  completedToday,
  totalToday,
  bigRocks,
}: SimplifiedDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Get today's tasks
  const todayTasks = tasks
    .filter((task) => task.dueDate === format(new Date(), "yyyy-MM-dd") && !task.completed)
    .slice(0, 5)

  // Get important tasks (Q1 and Q2)
  const importantTasks = tasks
    .filter((task) => (task.quadrant === "q1" || task.quadrant === "q2") && !task.completed)
    .slice(0, 5)

  // Get big rocks (high priority tasks)
  const visibleBigRocks = bigRocks.filter((rock) => !rock.completed).slice(0, 3)

  // Calculate completion percentage
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/add-task")} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Task
          </Button>
          <Button variant="outline" onClick={() => router.push("/quadrants")} className="gap-1">
            <Grid2X2 className="h-4 w-4" />
            Quadrants
          </Button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{completionPercentage}%</p>
                <p className="text-sm text-muted-foreground">
                  {completedToday} of {totalToday} tasks completed
                </p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-green-100 flex items-center justify-center">
                <span className="text-xl font-bold text-green-500">{completedToday}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{todayTasks.length}</p>
                <p className="text-sm text-muted-foreground">Tasks due today</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/task-inbox")}>
                View All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Big Rocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{bigRocks.filter((rock) => !rock.completed).length}</p>
                <p className="text-sm text-muted-foreground">Priority tasks remaining</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/big-rocks")}>
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Ritual Streak Section */}
      <div className="mb-6">
        <DailyRitualStreak />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Big Rocks Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Your Big Rocks
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/big-rocks")}>
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Focus on these high-priority items first</CardDescription>
            </CardHeader>
            <CardContent>
              {visibleBigRocks.length > 0 ? (
                <div className="space-y-3">
                  {visibleBigRocks.map((rock) => (
                    <div key={rock.id} className="flex items-start gap-3 p-3 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{rock.title}</div>
                        {rock.description && <div className="text-sm text-muted-foreground">{rock.description}</div>}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          rock.quadrant === "q1"
                            ? "bg-red-50 text-red-700"
                            : rock.quadrant === "q2"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-50 text-gray-700"
                        }
                      >
                        {rock.quadrant.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No big rocks defined</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/big-rocks")}>
                    Add Big Rocks
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/quadrants")}
            >
              <Grid2X2 className="h-8 w-8 text-blue-500" />
              <span>Quadrants</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/task-inbox")}
            >
              <ListTodo className="h-8 w-8 text-green-500" />
              <span>Task Inbox</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/planner")}
            >
              <Calendar className="h-8 w-8 text-purple-500" />
              <span>Weekly Plan</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push("/mission-vision")}
            >
              <Target className="h-8 w-8 text-amber-500" />
              <span>Mission & Vision</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="today">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today's Tasks</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push("/task-inbox")}>
                  View All
                </Button>
              </div>
              <CardDescription>Tasks due today: {format(new Date(), "EEEE, MMMM d")}</CardDescription>
            </CardHeader>
            <CardContent>
              {todayTasks.length > 0 ? (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        {task.description && <div className="text-sm text-muted-foreground">{task.description}</div>}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          task.quadrant === "q1"
                            ? "bg-red-50 text-red-700"
                            : task.quadrant === "q2"
                              ? "bg-blue-50 text-blue-700"
                              : task.quadrant === "q3"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-gray-50 text-gray-700"
                        }
                      >
                        {task.quadrant.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No tasks due today</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/add-task")}>
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="important">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Important Tasks</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push("/quadrants")}>
                  View Quadrants
                </Button>
              </div>
              <CardDescription>Focus on these important tasks (Q1 & Q2)</CardDescription>
            </CardHeader>
            <CardContent>
              {importantTasks.length > 0 ? (
                <div className="space-y-3">
                  {importantTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        {task.description && <div className="text-sm text-muted-foreground">{task.description}</div>}
                      </div>
                      <Badge
                        variant="outline"
                        className={task.quadrant === "q1" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}
                      >
                        {task.quadrant.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No important tasks</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/add-task")}>
                    Add Task
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

