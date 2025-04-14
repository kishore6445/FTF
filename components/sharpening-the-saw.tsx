"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Heart, Brain, Dumbbell, Sparkles, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface RenewalActivity {
  id: string
  title: string
  dimension: "physical" | "mental" | "social" | "spiritual"
  completed: boolean
  user_id: string
  date: string
}

export default function SharpeningTheSaw() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("physical")

  const [activities, setActivities] = useState<RenewalActivity[]>([])
  const [newActivity, setNewActivity] = useState("")

  // Today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (user) {
      fetchActivities()
    }
  }, [user])

  const fetchActivities = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Check if the renewal_activities table exists
      const { data: tableExists, error: tableError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "renewal_activities")
        .eq("table_schema", "public")
        .single()

      if (tableError || !tableExists) {
        console.log("Renewal activities table doesn't exist yet")
        setIsLoading(false)
        return
      }

      // Fetch today's activities
      const { data, error } = await supabase
        .from("renewal_activities")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)

      if (error) {
        console.error("Error fetching renewal activities:", error)
        toast({
          title: "Error",
          description: "Failed to load your renewal activities.",
          variant: "destructive",
        })
      } else {
        setActivities(data || [])
      }
    } catch (error) {
      console.error("Error in fetchActivities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActivity = (id: string) => {
    setActivities(
      activities.map((activity) => (activity.id === id ? { ...activity, completed: !activity.completed } : activity)),
    )
  }

  const addActivity = () => {
    if (!newActivity.trim()) return

    const activity: RenewalActivity = {
      id: crypto.randomUUID(),
      title: newActivity,
      dimension: activeTab as "physical" | "mental" | "social" | "spiritual",
      completed: false,
      user_id: user?.id || "",
      date: today,
    }

    setActivities([...activities, activity])
    setNewActivity("")
  }

  const deleteActivity = (id: string) => {
    setActivities(activities.filter((activity) => activity.id !== id))
  }

  const saveActivities = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Check if the renewal_activities table exists
      const { data: tableExists, error: tableError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "renewal_activities")
        .eq("table_schema", "public")

      if (tableError || !tableExists) {
        // Create the table if it doesn't exist
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS renewal_activities (
            id UUID PRIMARY KEY,
            title TEXT NOT NULL,
            dimension TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT FALSE,
            user_id UUID NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        const { error: createError } = await supabase.rpc("execute_sql", { sql: createTableSQL })

        if (createError) {
          console.error("Error creating renewal_activities table:", createError)
          throw new Error("Failed to create renewal_activities table")
        }
      }

      // Delete existing activities for today
      const { error: deleteError } = await supabase
        .from("renewal_activities")
        .delete()
        .eq("user_id", user.id)
        .eq("date", today)

      if (deleteError) {
        throw deleteError
      }

      // Insert new activities
      if (activities.length > 0) {
        const { error: insertError } = await supabase.from("renewal_activities").insert(
          activities.map((activity) => ({
            ...activity,
            user_id: user.id,
          })),
        )

        if (insertError) {
          throw insertError
        }
      }

      toast({
        title: "Saved",
        description: "Your renewal activities have been saved.",
      })
    } catch (error) {
      console.error("Error saving renewal activities:", error)
      toast({
        title: "Error",
        description: "Failed to save your renewal activities.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getDimensionActivities = (dimension: string) => {
    return activities.filter((activity) => activity.dimension === dimension)
  }

  const getCompletionPercentage = (dimension: string) => {
    const dimensionActivities = getDimensionActivities(dimension)
    if (dimensionActivities.length === 0) return 0

    const completed = dimensionActivities.filter((activity) => activity.completed).length
    return Math.round((completed / dimensionActivities.length) * 100)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sharpen the Saw</CardTitle>
          <CardDescription>
            Preserve and enhance your greatest asset: yourself
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="physical" className="flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4" />
                <span>Physical</span>
              </TabsTrigger>
              <TabsTrigger value="mental" className="flex items-center gap-1.5">
                <Brain className="h-4 w-4" />
                <span>Mental</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>Social</span>
              </TabsTrigger>
              <TabsTrigger value="spiritual" className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Spiritual</span>
                </TabsTrigger>
          </TabsList>

          <TabsContent value="physical">
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md text-sm">
                <p>Physical renewal includes exercise, nutrition, sleep, and stress management.</p>
              </div>

              <div className="space-y-2">
                {getDimensionActivities("physical").map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={activity.id}
                        checked={activity.completed}
                        onCheckedChange={() => toggleActivity(activity.id)}
                      />
                      <Label
                        htmlFor={activity.id}
                        className={activity.completed ? "line-through text-muted-foreground" : ""}
                      >
                        {activity.title}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteActivity(activity.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Add a physical renewal activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newActivity.trim()) {
                      addActivity()
                    }
                  }}
                />
                <Button onClick={addActivity} disabled={!newActivity.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mental">
            <div className="space-y-4">
              <div className="bg-purple-50 p-3 rounded-md text-sm">
                <p>Mental renewal includes reading, learning, planning, and creative activities.</p>
              </div>

              <div className="space-y-2">
                {getDimensionActivities("mental").map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={activity.id}
                        checked={activity.completed}
                        onCheckedChange={() => toggleActivity(activity.id)}
                      />
                      <Label
                        htmlFor={activity.id}
                        className={activity.completed ? "line-through text-muted-foreground" : ""}
                      >
                        {activity.title}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteActivity(activity.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Add a mental renewal activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newActivity.trim()) {
                      addActivity()
                    }
                  }}
                />
                <Button onClick={addActivity} disabled={!newActivity.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social">
            <div className="space-y-4">
              <div className="bg-pink-50 p-3 rounded-md text-sm">
                <p>Social/Emotional renewal includes meaningful connections, service, empathy, and synergy.</p>
              </div>

              <div className="space-y-2">
                {getDimensionActivities("social").map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={activity.id}
                        checked={activity.completed}
                        onCheckedChange={() => toggleActivity(activity.id)}
                      />
                      <Label
                        htmlFor={activity.id}
                        className={activity.completed ? "line-through text-muted-foreground" : ""}
                      >
                        {activity.title}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteActivity(activity.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Add a social/emotional renewal activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newActivity.trim()) {
                      addActivity()
                    }
                  }}
                />
                <Button onClick={addActivity} disabled={!newActivity.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spiritual">
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-md text-sm">
                <p>Spiritual renewal includes value clarification, meditation, inspirational study, and communion with nature.</p>
              </div>

              <div className="space-y-2">
                {getDimensionActivities("spiritual").map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={activity.id}
                        checked={activity.completed}
                        onCheckedChange={() => toggleActivity(activity.id)}
                      />
                      <Label
                        htmlFor={activity.id}
                        className={activity.completed ? "line-through text-muted-foreground" : ""}
                      >
                        {activity.title}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteActivity(activity.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Add a spiritual renewal activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newActivity.trim()) {
                      addActivity()
                    }
                  }}
                />
                <Button onClick={addActivity} disabled={!newActivity.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  )
}

