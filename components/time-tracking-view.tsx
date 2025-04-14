"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, isMockMode } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, AlertTriangle, BarChart2, Clock, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  format,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
  isToday,
  isThisWeek,
  isThisMonth,
  addDays,
} from "date-fns"

interface PomodoroSession {
  id: string
  task_id: string
  task_title: string
  start_time: string
  duration: number
  completed: boolean
  user_id: string
}

interface TaskTimeData {
  taskId: string
  taskTitle: string
  totalTime: number
  sessions: number
}

export default function TimeTrackingView() {
  const { user } = useAuth()
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalTimeToday, setTotalTimeToday] = useState(0)
  const [totalTimeWeek, setTotalTimeWeek] = useState(0)
  const [totalTimeMonth, setTotalTimeMonth] = useState(0)
  const [tableExists, setTableExists] = useState(true)
  const [taskTimeData, setTaskTimeData] = useState<TaskTimeData[]>([])
  const [dailyData, setDailyData] = useState<{ date: Date; totalTime: number }[]>([])

  useEffect(() => {
    if (!user) return

    const fetchPomodoroSessions = async () => {
      try {
        setLoading(true)
        setError(null)

        // First check if we're in mock mode
        if (isMockMode()) {
          // Return mock data
          const mockSessions = [
            {
              id: "mock-1",
              task_id: "mock-task-1",
              task_title: "Mock Pomodoro Session 1",
              start_time: new Date().toISOString(),
              duration: 1500, // 25 minutes
              completed: true,
              user_id: user.id,
            },
            {
              id: "mock-2",
              task_id: "mock-task-2",
              task_title: "Mock Pomodoro Session 2",
              start_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              duration: 1800, // 30 minutes
              completed: true,
              user_id: user.id,
            },
          ]

          setPomodoroSessions(mockSessions)
          setTotalTimeToday(1500)
          setTotalTimeWeek(3300)
          setTotalTimeMonth(3300)

          // Generate mock task time data
          setTaskTimeData([
            { taskId: "mock-task-1", taskTitle: "Mock Pomodoro Session 1", totalTime: 1500, sessions: 1 },
            { taskId: "mock-task-2", taskTitle: "Mock Pomodoro Session 2", totalTime: 1800, sessions: 1 },
          ])

          // Generate mock daily data
          const today = new Date()
          const mockDailyData = Array.from({ length: 7 }, (_, i) => {
            const date = addDays(today, -i)
            return {
              date,
              totalTime: Math.floor(Math.random() * 3600) + 1800, // Random time between 30-90 minutes
            }
          })
          setDailyData(mockDailyData)

          setLoading(false)
          return
        }

        // Check if the table exists first
        const { data: tableCheck, error: tableError } = await supabase.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'pomodoro_sessions'
          );
        `)

        if (tableError) {
          console.error("Error checking if table exists:", tableError)
          setTableExists(false)
          setError("The pomodoro_sessions table doesn't exist yet. Please set up your database.")
          setPomodoroSessions([])
          setLoading(false)
          return
        }

        // Check if the table exists from the result
        if (tableCheck && tableCheck.length > 0 && !tableCheck[0].exists) {
          setTableExists(false)
          setError("The pomodoro_sessions table doesn't exist yet. Please set up your database.")
          setPomodoroSessions([])
          setLoading(false)
          return
        }

        // If we get here, the table should exist, so try to fetch data
        const { data, error } = await supabase
          .from("pomodoro_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("start_time", { ascending: false })

        if (error) {
          // Check if the error is because the table doesn't exist
          if (error.code === "42P01") {
            setTableExists(false)
            setError("The pomodoro_sessions table doesn't exist yet. Please set up your database.")
          } else {
            setError(`Error fetching pomodoro sessions: ${error.message}`)
          }
          setPomodoroSessions([])
          return
        }

        const sessions = data || []
        setPomodoroSessions(sessions)

        // Calculate time metrics
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }) // Monday as start of week
        const startOfCurrentMonth = startOfMonth(now)

        let todayTotal = 0
        let weekTotal = 0
        let monthTotal = 0

        // Process task time data
        const taskMap = new Map<string, { taskTitle: string; totalTime: number; sessions: number }>()

        // Process daily data for the last 7 days
        const last7Days = eachDayOfInterval({
          start: addDays(today, -6),
          end: today,
        })

        const dailyTimeMap = new Map<string, number>()
        last7Days.forEach((day) => {
          dailyTimeMap.set(format(day, "yyyy-MM-dd"), 0)
        })

        sessions.forEach((session) => {
          const sessionDate = new Date(session.start_time)
          const duration = session.duration

          // Calculate daily/weekly/monthly totals
          if (isToday(sessionDate)) {
            todayTotal += duration
          }

          if (isThisWeek(sessionDate, { weekStartsOn: 1 })) {
            weekTotal += duration
          }

          if (isThisMonth(sessionDate)) {
            monthTotal += duration
          }

          // Aggregate task data
          const taskKey = session.task_id
          if (!taskMap.has(taskKey)) {
            taskMap.set(taskKey, {
              taskTitle: session.task_title,
              totalTime: 0,
              sessions: 0,
            })
          }
          const taskData = taskMap.get(taskKey)!
          taskData.totalTime += duration
          taskData.sessions += 1

          // Aggregate daily data
          const dateKey = format(sessionDate, "yyyy-MM-dd")
          if (dailyTimeMap.has(dateKey)) {
            dailyTimeMap.set(dateKey, (dailyTimeMap.get(dateKey) || 0) + duration)
          }
        })

        // Convert task map to array and sort by total time
        const taskTimeArray = Array.from(taskMap.entries())
          .map(([taskId, data]) => ({
            taskId,
            taskTitle: data.taskTitle,
            totalTime: data.totalTime,
            sessions: data.sessions,
          }))
          .sort((a, b) => b.totalTime - a.totalTime)

        // Convert daily map to array
        const dailyTimeArray = Array.from(dailyTimeMap.entries())
          .map(([dateStr, totalTime]) => ({
            date: new Date(dateStr),
            totalTime,
          }))
          .sort((a, b) => a.date.getTime() - b.date.getTime())

        setTaskTimeData(taskTimeArray)
        setDailyData(dailyTimeArray)
        setTotalTimeToday(todayTotal)
        setTotalTimeWeek(weekTotal)
        setTotalTimeMonth(monthTotal)
      } catch (err) {
        console.error("Error in fetchPomodoroSessions:", err)
        setError("An unexpected error occurred while fetching pomodoro sessions.")
      } finally {
        setLoading(false)
      }
    }

    fetchPomodoroSessions()
  }, [user])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM d, h:mm a")
  }

  // Calculate the maximum time value for the chart
  const maxDailyTime = Math.max(...dailyData.map((d) => d.totalTime), 3600) // At least 1 hour for scale

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!tableExists) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Database Setup Required</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error || "The pomodoro_sessions table doesn't exist yet."}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button size="sm" asChild>
              <Link href="/setup">Set Up Database</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeToday)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeWeek)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeMonth)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="daily">
            <Calendar className="h-4 w-4 mr-2" />
            Daily Breakdown
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <BarChart2 className="h-4 w-4 mr-2" />
            Tasks Breakdown
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Clock className="h-4 w-4 mr-2" />
            Recent Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length === 0 ? (
                <p className="text-muted-foreground">No time tracking data available for the past week.</p>
              ) : (
                <div className="h-64">
                  <div className="flex h-full items-end space-x-2">
                    {dailyData.map((day, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-full rounded-t ${isToday(day.date) ? "bg-primary" : "bg-primary/60"}`}
                          style={{
                            height: `${Math.max((day.totalTime / maxDailyTime) * 100, 5)}%`,
                          }}
                        ></div>
                        <div className="text-xs mt-2 text-center">
                          <div className={`font-medium ${isToday(day.date) ? "text-primary" : ""}`}>
                            {format(day.date, "EEE")}
                          </div>
                          <div className="text-muted-foreground">{format(day.date, "d")}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{Math.floor(day.totalTime / 60)}m</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Spent by Task</CardTitle>
            </CardHeader>
            <CardContent>
              {taskTimeData.length === 0 ? (
                <p className="text-muted-foreground">No task time data available.</p>
              ) : (
                <div className="space-y-4">
                  {taskTimeData.slice(0, 10).map((task) => (
                    <div key={task.taskId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium truncate max-w-[70%]">{task.taskTitle}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(task.totalTime)} • {task.sessions} {task.sessions === 1 ? "session" : "sessions"}
                        </div>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min((task.totalTime / (taskTimeData[0]?.totalTime || 1)) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Pomodoro Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {pomodoroSessions.length === 0 ? (
                <p className="text-muted-foreground">No pomodoro sessions recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {pomodoroSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{session.task_title}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(session.start_time)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatTime(session.duration)}</p>
                        <p className="text-sm text-muted-foreground">{session.completed ? "Completed" : "Partial"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

