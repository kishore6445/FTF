"use client"

import { useState, useEffect } from "react"
import { Loader2, Clock, ArrowRight, Plus, CalendarIcon, Target, Compass, BookOpen } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export default function PlannerPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [weeklyTasks, setWeeklyTasks] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [weekTheme, setWeekTheme] = useState("Focus on high-impact Q2 activities")

  const client = createServerComponentClient({ cookies })

  useEffect(() => {
    if (!user) return

    async function fetchTasks() {
      setIsLoading(true)
      try {
        const { data, error } = await client
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching tasks:", error)
        } else {
          setTasks(data || [])

          // Organize tasks by day of week
          const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday
          const weekDays = Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(startDate, i)
            const dayStr = format(day, "yyyy-MM-dd")
            return {
              date: day,
              tasks: (data || []).filter((task: any) => {
                const taskDate = task.due_date || task.dueDate
                return taskDate === dayStr
              }),
            }
          })
          setWeeklyTasks(weekDays)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [user])

  // Get tasks for the selected day
  const selectedDayTasks = tasks.filter((task) => {
    const taskDate = task.due_date || task.dueDate
    if (!taskDate) return false
    return isSameDay(new Date(taskDate), selectedDay)
  })

  // Get big rocks (important tasks)
  const bigRocks = tasks.filter((task) => task.is_big_rock && !task.completed).slice(0, 5)

  // Get upcoming deadlines
  const upcomingDeadlines = tasks
    .filter((task) => {
      const taskDate = task.due_date || task.dueDate
      if (!taskDate || task.completed) return false
      const dueDate = new Date(taskDate)
      const now = new Date()
      const sevenDaysLater = new Date()
      sevenDaysLater.setDate(now.getDate() + 7)
      return dueDate >= now && dueDate <= sevenDaysLater
    })
    .sort((a, b) => {
      const dateA = new Date(a.due_date || a.dueDate)
      const dateB = new Date(b.due_date || b.dueDate)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Weekly Planner</h1>
          <p className="text-muted-foreground">Plan your week based on your priorities</p>
        </div>
        <div className="flex gap-2">
          <Link href="/franklin-planner">
            <Button className="gap-2">
              <BookOpen className="h-4 w-4" />
              Open Franklin Planner
            </Button>
          </Link>
          <Link href="/add-task">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Weekly Theme */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Weekly Theme
                  </h2>
                  <p className="text-blue-800 dark:text-blue-300 italic">"{weekTheme}"</p>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  <div>
                    Week of {format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMMM d")} -{" "}
                    {format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), "MMMM d, yyyy")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
              <CardDescription>View and manage your tasks for each day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="week">
                <TabsList className="mb-4">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
                <TabsContent value="week">
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyTasks.map((day, i) => {
                      const isToday = format(new Date(), "yyyy-MM-dd") === format(day.date, "yyyy-MM-dd")
                      const isSelected = isSameDay(selectedDay, day.date)
                      return (
                        <div
                          key={i}
                          className={`border rounded p-2 min-h-[150px] cursor-pointer transition-colors ${
                            isToday ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" : ""
                          } ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
                          onClick={() => setSelectedDay(day.date)}
                        >
                          <div className="font-medium text-sm mb-1">{format(day.date, "EEE")}</div>
                          <div className="text-xs text-muted-foreground mb-2">{format(day.date, "MMM d")}</div>
                          <div className="space-y-1">
                            {day.tasks.length > 0 ? (
                              day.tasks.slice(0, 3).map((task: any) => (
                                <div key={task.id} className="text-xs p-1 bg-gray-50 dark:bg-gray-800 rounded truncate">
                                  {task.title || task.name}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400 italic">No tasks</div>
                            )}
                            {day.tasks.length > 3 && (
                              <div className="text-xs text-blue-500">+{day.tasks.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
                <TabsContent value="month">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Selected Day Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Tasks for {format(selectedDay, "EEEE, MMMM d")}</CardTitle>
                <CardDescription>Manage your tasks for the selected day</CardDescription>
              </div>
              <Link href="/add-task">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {selectedDayTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 border rounded-md">
                      <div
                        className={`w-1 self-stretch rounded-full ${
                          task.quadrant === "q1"
                            ? "bg-red-500"
                            : task.quadrant === "q2"
                              ? "bg-blue-500"
                              : task.quadrant === "q3"
                                ? "bg-amber-500"
                                : "bg-gray-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {task.quadrant === "q1"
                              ? "Q1: Urgent & Important"
                              : task.quadrant === "q2"
                                ? "Q2: Important, Not Urgent"
                                : task.quadrant === "q3"
                                  ? "Q3: Urgent, Not Important"
                                  : "Q4: Not Important or Urgent"}
                          </Badge>
                          {task.is_big_rock && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                            >
                              Big Rock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks scheduled for this day</p>
                  <Link href="/add-task">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Planning Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Planning Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/franklin-planner">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Franklin Covey Planner
                </Button>
              </Link>
              <Link href="/big-rocks">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Big Rocks
                </Button>
              </Link>
              <Link href="/quadrants">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Quadrants
                </Button>
              </Link>
              <Link href="/mission-vision">
                <Button variant="outline" className="w-full justify-start">
                  <Compass className="h-4 w-4 mr-2" />
                  Mission & Vision
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Big Rocks */}
          <Card>
            <CardHeader>
              <CardTitle>Big Rocks</CardTitle>
              <CardDescription>Your most important priorities</CardDescription>
            </CardHeader>
            <CardContent>
              {bigRocks.length > 0 ? (
                <div className="space-y-3">
                  {bigRocks.map((rock) => (
                    <div
                      key={rock.id}
                      className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md"
                    >
                      <Target className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div className="text-sm font-medium">{rock.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No big rocks defined</p>
                  <Link href="/big-rocks">
                    <Button variant="outline" size="sm" className="mt-2">
                      Define Big Rocks
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/big-rocks" className="w-full">
                <Button variant="ghost" size="sm" className="w-full">
                  View All Big Rocks
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDeadlines.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                    >
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: {format(new Date(task.due_date || task.dueDate), "MMM d")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">No upcoming deadlines</div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/task-inbox" className="w-full">
                <Button variant="ghost" size="sm" className="w-full">
                  View All Tasks
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Covey Quote */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-100 dark:border-purple-900/30">
            <CardContent className="pt-6">
              <blockquote className="italic text-purple-800 dark:text-purple-300">
                "The key is not to prioritize what's on your schedule, but to schedule your priorities."
              </blockquote>
              <div className="text-right text-sm text-purple-600 dark:text-purple-400 mt-2">— Stephen R. Covey</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

