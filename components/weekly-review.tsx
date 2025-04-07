"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle2, ArrowRight, RefreshCw, Lightbulb, Target } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"

export default function WeeklyReview() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("reflect")
  const [isSaving, setIsSaving] = useState(false)

  // Get current week range
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 })
  const weekRange = `${format(startOfCurrentWeek, "MMM d")} - ${format(endOfCurrentWeek, "MMM d, yyyy")}`

  // Form state
  const [reflection, setReflection] = useState({
    accomplishments: "",
    lessons: "",
    incomplete: "",
    relationships: "",
    renewal: "",
  })

  const [planning, setPlanning] = useState({
    bigRocks: "",
    roles: "",
    goals: "",
    appointments: "",
    delegation: "",
  })

  const handleReflectionChange = (field: keyof typeof reflection, value: string) => {
    setReflection((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePlanningChange = (field: keyof typeof planning, value: string) => {
    setPlanning((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveWeeklyReview = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Check if the weekly_reviews table exists
      const { data: tableExists, error: tableError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "weekly_reviews")
        .eq("table_schema", "public")
        .single()

      if (tableError || !tableExists) {
        // Create the table if it doesn't exist
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS weekly_reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            week_start DATE NOT NULL,
            week_end DATE NOT NULL,
            accomplishments TEXT,
            lessons TEXT,
            incomplete TEXT,
            relationships TEXT,
            renewal TEXT,
            big_rocks TEXT,
            roles TEXT,
            goals TEXT,
            appointments TEXT,
            delegation TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        const { error: createError } = await supabase.rpc("execute_sql", { sql: createTableSQL })

        if (createError) {
          console.error("Error creating weekly_reviews table:", createError)
          throw new Error("Failed to create weekly_reviews table")
        }
      }

      // Check if a review for this week already exists
      const { data: existingReview, error: checkError } = await supabase
        .from("weekly_reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("week_start", format(startOfCurrentWeek, "yyyy-MM-dd"))
        .maybeSingle()

      let result

      if (existingReview) {
        // Update existing review
        result = await supabase
          .from("weekly_reviews")
          .update({
            ...reflection,
            ...planning,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id)
      } else {
        // Insert new review
        result = await supabase.from("weekly_reviews").insert({
          user_id: user.id,
          week_start: format(startOfCurrentWeek, "yyyy-MM-dd"),
          week_end: format(endOfCurrentWeek, "yyyy-MM-dd"),
          ...reflection,
          ...planning,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      if (result.error) {
        throw result.error
      }

      toast({
        title: "Saved",
        description: "Your weekly review has been saved.",
      })
    } catch (error) {
      console.error("Error saving weekly review:", error)
      toast({
        title: "Error",
        description: "Failed to save your weekly review.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Weekly Review & Renewal</CardTitle>
            <CardDescription>Reflect, learn, and plan for the week ahead</CardDescription>
          </div>
          <div className="text-sm font-medium">{weekRange}</div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="reflect" className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" />
              <span>Reflect & Learn</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              <span>Plan & Prepare</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reflect" className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h3 className="font-medium flex items-center mb-2">
                <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                Reflection Process
              </h3>
              <p className="text-sm text-muted-foreground">
                Take time to reflect on the past week before planning the next. This helps you learn from experience and
                make better decisions going forward.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accomplishments">What were your key accomplishments this week?</Label>
                <Textarea
                  id="accomplishments"
                  placeholder="List your wins and achievements..."
                  value={reflection.accomplishments}
                  onChange={(e) => handleReflectionChange("accomplishments", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="lessons">What lessons did you learn?</Label>
                <Textarea
                  id="lessons"
                  placeholder="What insights or lessons did you gain?"
                  value={reflection.lessons}
                  onChange={(e) => handleReflectionChange("lessons", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="incomplete">What remained incomplete?</Label>
                <Textarea
                  id="incomplete"
                  placeholder="What tasks or goals didn't get completed?"
                  value={reflection.incomplete}
                  onChange={(e) => handleReflectionChange("incomplete", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="relationships">How did you strengthen key relationships?</Label>
                <Textarea
                  id="relationships"
                  placeholder="Which relationships did you nurture or neglect?"
                  value={reflection.relationships}
                  onChange={(e) => handleReflectionChange("relationships", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="renewal">How did you sharpen the saw?</Label>
                <Textarea
                  id="renewal"
                  placeholder="How did you renew yourself physically, mentally, socially, and spiritually?"
                  value={reflection.renewal}
                  onChange={(e) => handleReflectionChange("renewal", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("plan")} className="mt-4">
                Continue to Planning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md mb-6">
              <h3 className="font-medium flex items-center mb-2">
                <Target className="h-4 w-4 mr-2 text-green-600" />
                Planning Process
              </h3>
              <p className="text-sm text-muted-foreground">
                Plan your week with your big rocks first, then schedule your most important priorities before anything
                else.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bigRocks">What are your big rocks for next week?</Label>
                <Textarea
                  id="bigRocks"
                  placeholder="List your most important priorities..."
                  value={planning.bigRocks}
                  onChange={(e) => handlePlanningChange("bigRocks", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="roles">What key roles need attention next week?</Label>
                <Textarea
                  id="roles"
                  placeholder="Which of your roles need focus next week?"
                  value={planning.roles}
                  onChange={(e) => handlePlanningChange("roles", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="goals">What progress on goals will you make?</Label>
                <Textarea
                  id="goals"
                  placeholder="What specific progress on your goals will you achieve?"
                  value={planning.goals}
                  onChange={(e) => handlePlanningChange("goals", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="appointments">What key appointments do you need to schedule?</Label>
                <Textarea
                  id="appointments"
                  placeholder="What meetings or appointments are essential?"
                  value={planning.appointments}
                  onChange={(e) => handlePlanningChange("appointments", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="delegation">What can you delegate or eliminate?</Label>
                <Textarea
                  id="delegation"
                  placeholder="What tasks can be delegated, automated, or eliminated?"
                  value={planning.delegation}
                  onChange={(e) => handlePlanningChange("delegation", e.target.value)}
                  className="min-h-[100px] mt-2"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("reflect")}>
                Back to Reflection
              </Button>
              <Button onClick={saveWeeklyReview} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Weekly Review
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

