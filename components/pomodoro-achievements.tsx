"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { format, startOfDay, startOfWeek } from "date-fns"
import { Loader2, Award, Clock, Calendar, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface PomodoroSession {
  id: string
  task_id: string | null
  task_title: string
  start_time: string
  duration: number
  completed: boolean
  user_id: string
}

interface AchievementStats {
  totalSessions: number
  totalMinutes: number
  dailyStreak: number
  bestDay: {
    date: string
    sessions: number
    minutes: number
  }
  weeklyProgress: {
    day: string
    minutes: number
  }[]
}

export function PomodoroAchievements() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [stats, setStats] = useState<AchievementStats>({
    totalSessions: 0,
    totalMinutes: 0,
    dailyStreak: 0,
    bestDay: {
      date: "",
      sessions: 0,
      minutes: 0,
    },
    weeklyProgress: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSessions, setExpandedSessions] = useState(false)

  // Number of sessions to show when collapsed
  const DEFAULT_VISIBLE_SESSIONS = 2

  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("pomodoro_sessions")
        .select("*")
        .eq("user_id", user?.id)
        .order("start_time", { ascending: false })

      if (error) throw error

      setSessions(data || [])
      calculateStats(data || [])
    } catch (err) {
      console.error("Error fetching pomodoro sessions:", err)
      setError("Failed to load your achievements")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (sessions: PomodoroSession[]) => {
    if (!sessions.length) return

    // Total sessions and minutes
    const totalSessions = sessions.length
    const totalMinutes = Math.floor(sessions.reduce((sum, session) => sum + session.duration, 0) / 60)

    // Group sessions by day
    const sessionsByDay = sessions.reduce(
      (acc, session) => {
        const day = format(new Date(session.start_time), "yyyy-MM-dd")
        if (!acc[day]) {
          acc[day] = {
            sessions: 0,
            minutes: 0,
          }
        }
        acc[day].sessions += 1
        acc[day].minutes += Math.floor(session.duration / 60)
        return acc
      },
      {} as Record<string, { sessions: number; minutes: number }>,
    )

    // Find best day
    let bestDay = {
      date: "",
      sessions: 0,
      minutes: 0,
    }

    Object.entries(sessionsByDay).forEach(([date, data]) => {
      if (data.minutes > bestDay.minutes) {
        bestDay = {
          date,
          sessions: data.sessions,
          minutes: data.minutes,
        }
      }
    })

    // Calculate streak
    const today = startOfDay(new Date())
    let streak = 0
    let currentDate = today

    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      if (sessionsByDay[dateStr]) {
        streak++
        currentDate = new Date(currentDate.getTime() - 86400000) // Subtract one day
      } else {
        break
      }
    }

    // Weekly progress
    const startOfThisWeek = startOfWeek(new Date())
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfThisWeek.getTime() + i * 86400000)
      const dayStr = format(day, "yyyy-MM-dd")
      const dayName = format(day, "EEE")
      return {
        day: dayName,
        minutes: sessionsByDay[dayStr]?.minutes || 0,
      }
    })

    setStats({
      totalSessions,
      totalMinutes,
      dailyStreak: streak,
      bestDay,
      weeklyProgress,
    })
  }

  const toggleExpandSessions = () => {
    setExpandedSessions(!expandedSessions)
  }

  // Determine which sessions to display based on expanded state
  const visibleSessions = expandedSessions ? sessions.slice(0, 5) : sessions.slice(0, DEFAULT_VISIBLE_SESSIONS)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{stats.totalMinutes}</p>
              <p className="text-sm text-muted-foreground">Total Minutes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Calendar className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.dailyStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
              <p className="text-2xl font-bold">{stats.bestDay.minutes}</p>
              <p className="text-sm text-muted-foreground">Best Day (minutes)</p>
              {stats.bestDay.date && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(stats.bestDay.date), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.weeklyProgress.map((day) => {
              const maxMinutes = Math.max(...stats.weeklyProgress.map((d) => d.minutes), 60)
              const percentage = Math.max(5, (day.minutes / maxMinutes) * 100)

              return (
                <div key={day.day} className="flex items-center gap-2">
                  <div className="w-10 text-sm">{day.day}</div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="w-12 text-sm text-right">{day.minutes}m</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleSessions.map((session) => (
              <div key={session.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{session.task_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.start_time), "MMM d, h:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{Math.floor(session.duration / 60)}m</p>
                  <p className="text-sm text-muted-foreground">{session.completed ? "Completed" : "Partial"}</p>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No pomodoro sessions recorded yet. Start your first session!
              </p>
            )}

            {sessions.length > DEFAULT_VISIBLE_SESSIONS && (
              <Button
                variant="ghost"
                className="w-full mt-2 flex items-center justify-center"
                onClick={toggleExpandSessions}
              >
                {expandedSessions ? (
                  <>
                    Show Less <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

