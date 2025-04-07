"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Sunrise, Sun, Sunset, Moon, Plus, CheckCircle2, Clock, RotateCcw, Sparkles, Award, Flame } from "lucide-react"

interface Ritual {
  id: string
  title: string
  description: string | null
  user_id: string
  created_at: string
  category: string
  time_of_day: string
  days_of_week: string[]
}

interface RitualCompletion {
  id: string
  ritual_id: string
  completed_at: string
  user_id: string
  missed: boolean
}

export default function DailyRitualsTab() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [completions, setCompletions] = useState<RitualCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTimeOfDay, setActiveTimeOfDay] = useState("morning")
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchRituals()
    fetchTodayCompletions()
  }, [])

  const fetchRituals = async () => {
    try {
      const { data, error } = await supabase.from("rituals").select("*").order("created_at", { ascending: false })

      if (error) throw error

      if (data) {
        setRituals(data)
        calculateStreaks(data)
      }
    } catch (error) {
      console.error("Error fetching rituals:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase.from("ritual_completions").select("*").gte("completed_at", today)

      if (error) throw error

      if (data) {
        setCompletions(data)
      }
    } catch (error) {
      console.error("Error fetching completions:", error)
    }
  }

  const calculateStreaks = async (ritualsList: Ritual[]) => {
    const streakData: Record<string, number> = {}

    for (const ritual of ritualsList) {
      try {
        const { data, error } = await supabase
          .from("ritual_completions")
          .select("*")
          .eq("ritual_id", ritual.id)
          .order("completed_at", { ascending: false })
          .limit(30)

        if (error) throw error

        if (data && data.length > 0) {
          let streak = 0
          const currentDate = new Date()
          currentDate.setHours(0, 0, 0, 0)

          // Check if completed today
          const todayCompletion = data.find((c) => {
            const completionDate = new Date(c.completed_at)
            return completionDate.toDateString() === currentDate.toDateString()
          })

          if (todayCompletion) {
            streak = 1

            // Check previous days
            for (let i = 1; i < 30; i++) {
              const prevDate = new Date(currentDate)
              prevDate.setDate(prevDate.getDate() - i)

              const prevCompletion = data.find((c) => {
                const completionDate = new Date(c.completed_at)
                return completionDate.toDateString() === prevDate.toDateString()
              })

              if (prevCompletion) {
                streak++
              } else {
                break
              }
            }
          }

          streakData[ritual.id] = streak
        } else {
          streakData[ritual.id] = 0
        }
      } catch (error) {
        console.error("Error calculating streak:", error)
        streakData[ritual.id] = 0
      }
    }

    setStreaks(streakData)
  }

  const toggleRitualCompletion = async (ritual: Ritual) => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const isCompleted = completions.some((c) => c.ritual_id === ritual.id)

      if (isCompleted) {
        // Find the completion to delete
        const completionToDelete = completions.find((c) => c.ritual_id === ritual.id)

        if (completionToDelete) {
          const { error } = await supabase.from("ritual_completions").delete().eq("id", completionToDelete.id)

          if (error) throw error

          setCompletions((prev) => prev.filter((c) => c.id !== completionToDelete.id))

          toast({
            title: "Ritual unmarked",
            description: `"${ritual.title}" has been unmarked for today.`,
          })
        }
      } else {
        // Add new completion
        const { data, error } = await supabase
          .from("ritual_completions")
          .insert({
            ritual_id: ritual.id,
            completed_at: new Date().toISOString(),
            user_id: ritual.user_id,
            missed: false,
          })
          .select()

        if (error) throw error

        if (data) {
          setCompletions((prev) => [...prev, data[0]])

          toast({
            title: "Ritual completed!",
            description: `"${ritual.title}" has been marked as complete.`,
          })
        }
      }

      // Recalculate streaks
      calculateStreaks(rituals)
    } catch (error) {
      console.error("Error toggling ritual completion:", error)
      toast({
        title: "Error",
        description: "Failed to update ritual status.",
        variant: "destructive",
      })
    }
  }

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case "morning":
        return <Sunrise className="h-5 w-5 text-amber-500" />
      case "afternoon":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "evening":
        return <Sunset className="h-5 w-5 text-orange-500" />
      case "night":
        return <Moon className="h-5 w-5 text-indigo-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStreakBadge = (ritualId: string) => {
    const streak = streaks[ritualId] || 0

    if (streak === 0) return null

    let color = "bg-gray-100 text-gray-800"
    let icon = <Flame className="h-3 w-3 mr-1" />

    if (streak >= 30) {
      color = "bg-purple-100 text-purple-800"
      icon = <Award className="h-3 w-3 mr-1" />
    } else if (streak >= 7) {
      color = "bg-blue-100 text-blue-800"
      icon = <Sparkles className="h-3 w-3 mr-1" />
    }

    return (
      <Badge variant="outline" className={`${color} ml-2`}>
        {icon}
        {streak} day{streak !== 1 ? "s" : ""}
      </Badge>
    )
  }

  const filteredRituals = rituals.filter((ritual) => ritual.time_of_day === activeTimeOfDay)

  const calculateCompletionRate = (timeOfDay: string) => {
    const ritualsByTime = rituals.filter((r) => r.time_of_day === timeOfDay)

    if (ritualsByTime.length === 0) return 0

    const completedCount = ritualsByTime.filter((ritual) => completions.some((c) => c.ritual_id === ritual.id)).length

    return (completedCount / ritualsByTime.length) * 100
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Daily Rituals</CardTitle>
          <Button variant="outline" size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Add Ritual
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTimeOfDay} onValueChange={setActiveTimeOfDay} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="morning" className="flex items-center gap-1">
              <Sunrise className="h-4 w-4" />
              <span className="hidden sm:inline">Morning</span>
            </TabsTrigger>
            <TabsTrigger value="afternoon" className="flex items-center gap-1">
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Afternoon</span>
            </TabsTrigger>
            <TabsTrigger value="evening" className="flex items-center gap-1">
              <Sunset className="h-4 w-4" />
              <span className="hidden sm:inline">Evening</span>
            </TabsTrigger>
            <TabsTrigger value="night" className="flex items-center gap-1">
              <Moon className="h-4 w-4" />
              <span className="hidden sm:inline">Night</span>
            </TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>Completion Rate</span>
              <span>{Math.round(calculateCompletionRate(activeTimeOfDay))}%</span>
            </div>
            <Progress value={calculateCompletionRate(activeTimeOfDay)} className="h-2" />
          </div>

          <TabsContent value={activeTimeOfDay} className="mt-0">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading rituals...</div>
            ) : filteredRituals.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <RotateCcw className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No {activeTimeOfDay} rituals yet.</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Plus className="h-4 w-4 mr-1" />
                  Add {activeTimeOfDay} ritual
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRituals.map((ritual) => {
                  const isCompleted = completions.some((c) => c.ritual_id === ritual.id)

                  return (
                    <div
                      key={ritual.id}
                      className={`p-3 rounded-md border flex items-start gap-3 ${
                        isCompleted ? "bg-green-50 border-green-200" : "bg-white"
                      }`}
                    >
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => toggleRitualCompletion(ritual)}
                        className={isCompleted ? "text-green-500 border-green-500" : ""}
                      />

                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className={`font-medium ${isCompleted ? "line-through text-green-700" : ""}`}>
                            {ritual.title}
                          </h3>

                          {isCompleted && (
                            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          )}

                          {getStreakBadge(ritual.id)}
                        </div>

                        {ritual.description && <p className="text-sm text-gray-500 mt-1">{ritual.description}</p>}

                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          {getTimeOfDayIcon(ritual.time_of_day)}
                          <span className="ml-1 capitalize">{ritual.time_of_day}</span>

                          {ritual.category && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{ritual.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

