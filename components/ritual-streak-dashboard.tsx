"use client"

import { useState, useEffect } from "react"
import { format, subDays, isToday, differenceInDays } from "date-fns"
import { Flame } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface Ritual {
  id: string
  title: string
  description?: string
  streak: number
  lastCompleted?: string
  category?: string
  user_id: string
}

interface RitualCompletion {
  id: string
  ritual_id: string
  date: string
  user_id: string
}

export default function RitualStreakDashboard() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { user } = useAuth()
  const { toast } = useToast()

  // Generate last 30 days for the streak visualization
  const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i))

  useEffect(() => {
    if (user) {
      fetchRituals()
    }
  }, [user])

  const fetchRituals = async () => {
    if (!user) return

    setLoading(true)
    try {
      // First get all rituals
      const { data: ritualsData, error: ritualsError } = await supabase
        .from("rituals")
        .select("*")
        .eq("user_id", user.id)

      if (ritualsError) {
        console.error("Error fetching rituals:", ritualsError)
        return
      }

      // Then get all completions for the last 30 days
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd")
      const { data: completionsData, error: completionsError } = await supabase
        .from("ritual_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", thirtyDaysAgo)

      if (completionsError) {
        console.error("Error fetching ritual completions:", completionsError)
        return
      }

      // Process the data to calculate streaks
      const processedRituals = ritualsData.map((ritual) => {
        const ritualCompletions = completionsData.filter((completion) => completion.ritual_id === ritual.id)

        // Sort completions by date
        ritualCompletions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Calculate current streak
        let streak = 0
        const lastCompleted = ritualCompletions.length > 0 ? ritualCompletions[0].date : undefined

        // Check if the most recent completion is today or yesterday
        if (ritualCompletions.length > 0) {
          const mostRecentDate = new Date(ritualCompletions[0].date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (isToday(mostRecentDate) || differenceInDays(today, mostRecentDate) === 1) {
            // Count consecutive days
            let currentDate = isToday(mostRecentDate) ? subDays(today, 1) : today
            let consecutiveDays = isToday(mostRecentDate) ? 1 : 0

            for (let i = 0; i < ritualCompletions.length; i++) {
              const completionDate = new Date(ritualCompletions[i].date)
              completionDate.setHours(0, 0, 0, 0)

              if (differenceInDays(currentDate, completionDate) === 0) {
                consecutiveDays++
                currentDate = subDays(currentDate, 1)
              } else {
                break
              }
            }

            streak = consecutiveDays
          }
        }

        return {
          ...ritual,
          streak,
          lastCompleted,
        }
      })

      setRituals(processedRituals)
    } catch (error) {
      console.error("Error in fetchRituals:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRitualCompletion = async (ritualId: string, date: Date) => {
    if (!user) return

    try {
      const dateStr = format(date, "yyyy-MM-dd")

      // Check if completion already exists
      const { data: existingCompletion, error: checkError } = await supabase
        .from("ritual_completions")
        .select("*")
        .eq("ritual_id", ritualId)
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking completion:", checkError)
        return
      }

      if (existingCompletion) {
        // Delete the completion
        const { error: deleteError } = await supabase
          .from("ritual_completions")
          .delete()
          .eq("id", existingCompletion.id)

        if (deleteError) {
          console.error("Error deleting completion:", deleteError)
          return
        }

        toast({
          title: "Ritual marked as incomplete",
          description: `Removed completion for ${format(date, "MMMM d, yyyy")}`,
        })
      } else {
        // Add new completion
        const { error: insertError } = await supabase.from("ritual_completions").insert({
          ritual_id: ritualId,
          user_id: user.id,
          date: dateStr,
        })

        if (insertError) {
          console.error("Error adding completion:", insertError)
          return
        }

        toast({
          title: "Ritual completed!",
          description: `Marked as complete for ${format(date, "MMMM d, yyyy")}`,
        })
      }

      // Refresh rituals to update streaks
      fetchRituals()
    } catch (error) {
      console.error("Error in toggleRitualCompletion:", error)
    }
  }

  const isDateCompleted = (ritual: Ritual, date: Date) => {
    // This is a placeholder - you would need to check against your completions data
    // For now, we'll just return false
    return false
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥🔥🔥"
    if (streak >= 14) return "🔥🔥"
    if (streak >= 7) return "🔥"
    if (streak > 0) return "✨"
    return "🌱"
  }

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Incredible consistency!"
    if (streak >= 14) return "You're on fire!"
    if (streak >= 7) return "Great streak going!"
    if (streak > 0) return "Building momentum!"
    return "Start your streak today!"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Rituals</CardTitle>
          <CardDescription>Loading your ritual streaks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Daily Ritual Streaks
            </CardTitle>
            <CardDescription>Build consistency with your daily rituals</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchRituals()}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rituals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No rituals found. Start creating daily rituals to build streaks!
            </p>
            <Button variant="default">Create Your First Ritual</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {rituals.map((ritual) => (
              <div key={ritual.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{ritual.title}</h3>
                    {ritual.streak > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {ritual.streak} day streak
                      </Badge>
                    )}
                  </div>
                  <span className="text-xl" title={getStreakMessage(ritual.streak)}>
                    {getStreakEmoji(ritual.streak)}
                  </span>
                </div>

                {ritual.description && <p className="text-sm text-muted-foreground">{ritual.description}</p>}

                <div className="flex items-center gap-1 overflow-x-auto py-2 px-1">
                  {days.map((day) => {
                    const isCompleted = isDateCompleted(ritual, day)
                    const isToday = day.toDateString() === new Date().toDateString()

                    return (
                      <button
                        key={day.toISOString()}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-xs
                          ${
                            isCompleted
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }
                          ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}
                          transition-all
                        `}
                        onClick={() => toggleRitualCompletion(ritual.id, day)}
                        title={format(day, "MMMM d, yyyy")}
                      >
                        {format(day, "d")}
                      </button>
                    )
                  })}
                </div>

                <Progress
                  value={Math.min(ritual.streak * 3.33, 100)}
                  className="h-2"
                  title={`${ritual.streak} days - ${getStreakMessage(ritual.streak)}`}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Pro tip:</span> Consistency builds habits. Aim for at least 21 days!
        </div>
        <Button variant="outline" size="sm">
          View All Rituals
        </Button>
      </CardFooter>
    </Card>
  )
}

