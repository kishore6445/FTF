"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2, Save, BookOpen, Target, Heart, Compass } from "lucide-react"

interface PersonalStatement {
  mission: string
  vision: string
  values: string
  principles: string
  user_id: string
}

export default function PersonalMissionStatement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("mission")

  const [statement, setStatement] = useState<PersonalStatement>({
    mission: "",
    vision: "",
    values: "",
    principles: "",
    user_id: user?.id || "",
  })

  const [dailyAlignment, setDailyAlignment] = useState("")

  useEffect(() => {
    if (user) {
      fetchPersonalStatement()
    }
  }, [user])

  const fetchPersonalStatement = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Check if the table exists first
      const { data: tableExists, error: tableError } = await supabase
        .from("personal_statements")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (tableError || !tableExists) {
        console.log("Personal statements table doesn't exist yet")
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.from("personal_statements").select("*").eq("user_id", user.id).single()

      if (error) {
        if (error.code === "PGRST116") {
          // No data found, that's okay for new users
          console.log("No personal statement found for user")
        } else {
          console.error("Error fetching personal statement:", error)
          toast({
            title: "Error",
            description: "Failed to load your personal statement.",
            variant: "destructive",
          })
        }
      } else if (data) {
        setStatement({
          mission: data.mission || "",
          vision: data.vision || "",
          values: data.values || "",
          principles: data.principles || "",
          user_id: user.id,
        })
      }
    } catch (error) {
      console.error("Error in fetchPersonalStatement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePersonalStatement = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Check if record exists
      const { data: existingData, error: checkError } = await supabase
        .from("personal_statements")
        .select("id")
        .eq("user_id", user.id)
        .single()

      let result

      if (existingData) {
        // Update existing record
        result = await supabase
          .from("personal_statements")
          .update({
            mission: statement.mission,
            vision: statement.vision,
            values: statement.values,
            principles: statement.principles,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id)
      } else {
        // Insert new record
        result = await supabase.from("personal_statements").insert({
          ...statement,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      if (result.error) {
        throw result.error
      }

      toast({
        title: "Saved",
        description: "Your personal statement has been saved.",
      })
    } catch (error) {
      console.error("Error saving personal statement:", error)
      toast({
        title: "Error",
        description: "Failed to save your personal statement.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof PersonalStatement, value: string) => {
    setStatement((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Personal Mission Statement</CardTitle>
          <CardDescription>
            Define your purpose, vision, values, and principles to guide your daily decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="mission" className="flex items-center gap-1.5">
                <Compass className="h-4 w-4" />
                <span>Mission</span>
              </TabsTrigger>
              <TabsTrigger value="vision" className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                <span>Vision</span>
              </TabsTrigger>
              <TabsTrigger value="values" className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>Values</span>
              </TabsTrigger>
              <TabsTrigger value="principles" className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>Principles</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mission">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mission">Personal Mission Statement</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    What is your purpose? What contributions do you want to make in life?
                  </p>
                  <Textarea
                    id="mission"
                    placeholder="My personal mission is to..."
                    value={statement.mission}
                    onChange={(e) => handleChange("mission", e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vision">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vision">Personal Vision</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    What do you want to become? How do you see your ideal future?
                  </p>
                  <Textarea
                    id="vision"
                    placeholder="In the future, I see myself as..."
                    value={statement.vision}
                    onChange={(e) => handleChange("vision", e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="values">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="values">Core Values</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    What principles and values are most important to you?
                  </p>
                  <Textarea
                    id="values"
                    placeholder="My core values include..."
                    value={statement.values}
                    onChange={(e) => handleChange("values", e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="principles">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="principles">Guiding Principles</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    What principles guide your decisions and actions?
                  </p>
                  <Textarea
                    id="principles"
                    placeholder="The principles that guide my life are..."
                    value={statement.principles}
                    onChange={(e) => handleChange("principles", e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
          <Button onClick={savePersonalStatement} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Alignment</CardTitle>
          <CardDescription>Connect today's priorities with your mission and values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="alignment">How do today's priorities align with your mission?</Label>
              <Textarea
                id="alignment"
                placeholder="Reflect on how your tasks for today connect to your larger purpose..."
                value={dailyAlignment}
                onChange={(e) => setDailyAlignment(e.target.value)}
                className="min-h-[150px] mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

