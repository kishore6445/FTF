"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { supabase, isMockMode } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Save, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import DailyRituals from "./daily-rituals"

interface PersonalStatement {
  id: string
  mission: string
  vision: string
  eulogy: string
  values: string
  user_id: string
}

export default function MissionVisionView() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [statement, setStatement] = useState<PersonalStatement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("mission")

  useEffect(() => {
    if (!user) return
    fetchStatement()
  }, [user])

  const fetchStatement = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // If in mock mode, return mock data
      if (isMockMode()) {
        setStatement({
          id: "mock-id",
          mission: "To live a life of purpose and meaning, contributing positively to the world around me.",
          vision:
            "I see myself as a leader who inspires others, maintains a healthy work-life balance, and continues to grow personally and professionally.",
          eulogy:
            "They remembered me as someone who lived authentically, loved deeply, and made a difference in the lives of others.",
          values: "Integrity, Compassion, Growth, Balance, Courage",
          user_id: "mock-user",
        })
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("personal_statements")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Error fetching personal statement:", error)
        setError("Failed to load your personal statement. Please try again.")
        return
      }

      setStatement(
        data || {
          id: "",
          mission: "",
          vision: "",
          eulogy: "",
          values: "",
          user_id: user.id,
        },
      )
    } catch (err) {
      console.error("Error in fetchStatement:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !statement) return

    setSaving(true)
    try {
      // If in mock mode, just simulate saving
      if (isMockMode()) {
        setTimeout(() => {
          toast({
            title: "Saved",
            description: "Your personal statement has been saved.",
          })
          setSaving(false)
        }, 500)
        return
      }

      const now = new Date().toISOString()

      if (statement.id) {
        // Update existing statement
        const { error } = await supabase
          .from("personal_statements")
          .update({
            mission: statement.mission,
            vision: statement.vision,
            eulogy: statement.eulogy,
            values: statement.values,
            updated_at: now,
          })
          .eq("id", statement.id)
          .eq("user_id", user.id)

        if (error) {
          throw error
        }
      } else {
        // Create new statement
        const { error } = await supabase.from("personal_statements").insert({
          id: uuidv4(),
          mission: statement.mission,
          vision: statement.vision,
          eulogy: statement.eulogy,
          values: statement.values,
          user_id: user.id,
          created_at: now,
          updated_at: now,
        })

        if (error) {
          throw error
        }
      }

      toast({
        title: "Saved",
        description: "Your personal statement has been saved.",
      })

      // Refresh data
      fetchStatement()
    } catch (err) {
      console.error("Error saving personal statement:", err)
      toast({
        title: "Error saving",
        description: "Failed to save your personal statement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof PersonalStatement, value: string) => {
    if (!statement) return
    setStatement({ ...statement, [field]: value })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading personal statement</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchStatement}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Personal Statement</CardTitle>
              <CardDescription>Define your mission, vision, and values</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mission" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mission">Mission</TabsTrigger>
              <TabsTrigger value="vision">Vision</TabsTrigger>
              <TabsTrigger value="values">Values</TabsTrigger>
              <TabsTrigger value="eulogy">Eulogy</TabsTrigger>
            </TabsList>
            <TabsContent value="mission" className="mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your mission statement defines your purpose and what you want to accomplish in life.
                </p>
                <Textarea
                  placeholder="Enter your mission statement..."
                  className="min-h-[200px]"
                  value={statement?.mission || ""}
                  onChange={(e) => handleChange("mission", e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="vision" className="mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your vision statement describes what you want to become and achieve in the future.
                </p>
                <Textarea
                  placeholder="Enter your vision statement..."
                  className="min-h-[200px]"
                  value={statement?.vision || ""}
                  onChange={(e) => handleChange("vision", e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="values" className="mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Your core values guide your behavior and decisions.</p>
                <Textarea
                  placeholder="Enter your core values..."
                  className="min-h-[200px]"
                  value={statement?.values || ""}
                  onChange={(e) => handleChange("values", e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="eulogy" className="mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Write your own eulogy as if you lived your ideal life. How do you want to be remembered?
                </p>
                <Textarea
                  placeholder="Enter your eulogy..."
                  className="min-h-[200px]"
                  value={statement?.eulogy || ""}
                  onChange={(e) => handleChange("eulogy", e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DailyRituals />
    </div>
  )
}

