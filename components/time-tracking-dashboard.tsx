"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface TimeEntry {
  taskId: string
  taskTitle: string
  duration: number
  date: string
  quadrant?: string
}

interface TaskTimeData {
  name: string
  value: number
  id: string
  quadrant?: string
}

interface DayTimeData {
  name: string
  time: number
  date: string
}

export function TimeTrackingDashboard() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("daily")
  const { user } = useAuth()

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
  const QUADRANT_COLORS = {
    q1: "#ef4444", // Important & Urgent - Red
    q2: "#22c55e", // Important & Not Urgent - Green
    q3: "#f97316", // Not Important & Urgent - Orange
    q4: "#3b82f6", // Not Important & Not Urgent - Blue
    undefined: "#9ca3af", // Default - Gray
  }

  useEffect(() => {
    fetchTimeData()
  }, [user])

  const fetchTimeData = async () => {
    if (!user) return

    setLoading(true)

    try {
      // Fetch pomodoro sessions
      const { data: pomodoroData, error: pomodoroError } = await supabase
        .from("pomodoro_sessions")
        .select("id, task_id, task_title, start_time, duration")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false })

      if (pomodoroError) {
        console.error("Error fetching pomodoro sessions:", pomodoroError)
        setLoading(false)
        return
      }

      // Fetch tasks to get quadrant information
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, quadrant")
        .eq("user_id", user.id)

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError)
      }

      // Create a map of task IDs to quadrants
      const taskQuadrants = new Map()
      if (tasksData) {
        tasksData.forEach((task) => {
          taskQuadrants.set(task.id, task.quadrant)
        })
      }

      // Transform the data
      const entries =
        pomodoroData?.map((session) => ({
          taskId: session.task_id,
          taskTitle: session.task_title,
          duration: session.duration,
          date: format(new Date(session.start_time), "yyyy-MM-dd"),
          quadrant: taskQuadrants.get(session.task_id),
        })) || []

      setTimeEntries(entries)
    } catch (err) {
      console.error("Error in fetchTimeData:", err)
    } finally {
      setLoading(false)
    }
  }

  // Get data for the current day
  const getDailyData = (): TaskTimeData[] => {
    const today = format(new Date(), "yyyy-MM-dd")
    const todayEntries = timeEntries.filter((entry) => entry.date === today)

    // Group by task and sum durations
    const taskMap = new Map<string, TaskTimeData>()

    todayEntries.forEach((entry) => {
      if (taskMap.has(entry.taskId)) {
        const existing = taskMap.get(entry.taskId)!
        taskMap.set(entry.taskId, {
          ...existing,
          value: existing.value + entry.duration,
        })
      } else {
        taskMap.set(entry.taskId, {
          name: entry.taskTitle,
          value: entry.duration,
          id: entry.taskId,
          quadrant: entry.quadrant,
        })
      }
    })

    return Array.from(taskMap.values())
  }

  // Get data for the current week
  const getWeeklyData = (): DayTimeData[] => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Start on Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    // Create an array of all days in the week
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // Initialize data for each day
    const weekData = daysInWeek.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd")
      return {
        name: format(day, "EEE"), // Mon, Tue, etc.
        time: 0,
        date: dateStr,
      }
    })

    // Sum up time for each day
    timeEntries.forEach((entry) => {
      const dayIndex = weekData.findIndex((day) => day.date === entry.date)
      if (dayIndex >= 0) {
        weekData[dayIndex].time += entry.duration
      }
    })

    return weekData
  }

  // Get data for the current month
  const getMonthlyData = (): TaskTimeData[] => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const monthStartStr = format(monthStart, "yyyy-MM-dd")
    const monthEndStr = format(monthEnd, "yyyy-MM-dd")

    // Filter entries for the current month
    const monthEntries = timeEntries.filter((entry) => entry.date >= monthStartStr && entry.date <= monthEndStr)

    // Group by task and sum durations
    const taskMap = new Map<string, TaskTimeData>()

    monthEntries.forEach((entry) => {
      if (taskMap.has(entry.taskId)) {
        const existing = taskMap.get(entry.taskId)!
        taskMap.set(entry.taskId, {
          ...existing,
          value: existing.value + entry.duration,
        })
      } else {
        taskMap.set(entry.taskId, {
          name: entry.taskTitle,
          value: entry.duration,
          id: entry.taskId,
          quadrant: entry.quadrant,
        })
      }
    })

    return Array.from(taskMap.values())
  }

  // Get data grouped by quadrant
  const getQuadrantData = (): TaskTimeData[] => {
    // Group by quadrant and sum durations
    const quadrantMap = new Map<string, number>()

    timeEntries.forEach((entry) => {
      const quadrant = entry.quadrant || "unassigned"
      const currentValue = quadrantMap.get(quadrant) || 0
      quadrantMap.set(quadrant, currentValue + entry.duration)
    })

    // Transform to the required format
    return Array.from(quadrantMap.entries()).map(([quadrant, duration]) => {
      let name = "Unassigned"

      if (quadrant === "q1") name = "Q1: Important & Urgent"
      else if (quadrant === "q2") name = "Q2: Important & Not Urgent"
      else if (quadrant === "q3") name = "Q3: Not Important & Urgent"
      else if (quadrant === "q4") name = "Q4: Not Important & Not Urgent"

      return {
        name,
        value: duration,
        id: quadrant,
        quadrant,
      }
    })
  }

  // Format seconds as hours and minutes
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">{formatDuration(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  // Calculate total time for today
  const getTotalTimeToday = () => {
    const today = format(new Date(), "yyyy-MM-dd")
    return timeEntries.filter((entry) => entry.date === today).reduce((sum, entry) => sum + entry.duration, 0)
  }

  // Calculate total time for this week
  const getTotalTimeWeek = () => {
    const now = new Date()
    const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd")
    const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd")

    return timeEntries
      .filter((entry) => entry.date >= weekStart && entry.date <= weekEnd)
      .reduce((sum, entry) => sum + entry.duration, 0)
  }

  // Calculate total time for this month
  const getTotalTimeMonth = () => {
    const now = new Date()
    const monthStart = format(startOfMonth(now), "yyyy-MM-dd")
    const monthEnd = format(endOfMonth(now), "yyyy-MM-dd")

    return timeEntries
      .filter((entry) => entry.date >= monthStart && entry.date <= monthEnd)
      .reduce((sum, entry) => sum + entry.duration, 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(getTotalTimeToday())}</div>
            <p className="text-xs text-muted-foreground mt-1">Time tracked today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(getTotalTimeWeek())}</div>
            <p className="text-xs text-muted-foreground mt-1">Time tracked this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(getTotalTimeMonth())}</div>
            <p className="text-xs text-muted-foreground mt-1">Time tracked this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Today</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="quadrants">By Quadrant</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Spent Today</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {getDailyData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDailyData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${formatDuration(value)}`}
                    >
                      {getDailyData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.quadrant
                              ? QUADRANT_COLORS[entry.quadrant as keyof typeof QUADRANT_COLORS]
                              : COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No time tracked today</p>
                  <p className="text-sm mt-2">Start a timer on a task to track your time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Spent This Week</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {getWeeklyData().some((day) => day.time > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWeeklyData()}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${Math.floor(value / 3600)}h`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="time" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No time tracked this week</p>
                  <p className="text-sm mt-2">Start a timer on a task to track your time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Spent This Month</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {getMonthlyData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getMonthlyData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) =>
                        `${name.substring(0, 15)}${name.length > 15 ? "..." : ""}: ${formatDuration(value)}`
                      }
                    >
                      {getMonthlyData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.quadrant
                              ? QUADRANT_COLORS[entry.quadrant as keyof typeof QUADRANT_COLORS]
                              : COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No time tracked this month</p>
                  <p className="text-sm mt-2">Start a timer on a task to track your time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quadrants" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Time by Quadrant</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {getQuadrantData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getQuadrantData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${formatDuration(value)}`}
                    >
                      {getQuadrantData().map((entry) => (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={
                            entry.quadrant ? QUADRANT_COLORS[entry.quadrant as keyof typeof QUADRANT_COLORS] : "#9ca3af"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No time data available</p>
                  <p className="text-sm mt-2">Start a timer on a task to track your time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

