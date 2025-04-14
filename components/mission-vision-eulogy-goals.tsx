"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit, Save, BookOpen, Target, Heart, Compass } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface MissionVisionEulogyGoalsProps {
  userId?: string
}

interface PersonalStatement {
  mission: string
  vision: string
  eulogy: string
  values: string
}

export default function MissionVisionEulogyGoals({ userId }: MissionVisionEulogyGoalsProps) {
  const [activeTab, setActiveTab] = useState("mission")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [statements, setStatements] = useState<PersonalStatement>({
    mission: "",
    vision: "",
    eulogy: "",
    values: "",
  })
  const [editedStatements, setEditedStatements] = useState<PersonalStatement>({
    mission: "",
    vision: "",
    eulogy: "",
    values: "",
  })

  useEffect(() => {
    if (!userId) return

    const fetchStatements = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("personal_statements").select("*").eq("user_id", userId).single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is the error code for "no rows returned"
          console.error("Error fetching personal statements:", error)
        }

        if (data) {
          setStatements({
            mission: data.mission || "",
            vision: data.vision || "",
            eulogy: data.eulogy || "",
            values: data.values || "",
          })
          setEditedStatements({
            mission: data.mission || "",
            vision: data.vision || "",
            eulogy: data.eulogy || "",
            values: data.values || "",
          })
        }
      } catch (error) {
        console.error("Error fetching personal statements:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatements()
  }, [userId])

  const handleSave = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("personal_statements").select("id").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking for existing statements:", error)
        return
      }

      if (data) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("personal_statements")
          .update({
            mission: editedStatements.mission,
            vision: editedStatements.vision,
            eulogy: editedStatements.eulogy,
            values: editedStatements.values,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id)

        if (updateError) {
          console.error("Error updating personal statements:", updateError)
          return
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase.from("personal_statements").insert({
          user_id: userId,
          mission: editedStatements.mission,
          vision: editedStatements.vision,
          eulogy: editedStatements.eulogy,
          values: editedStatements.values,
        })

        if (insertError) {
          console.error("Error inserting personal statements:", insertError)
          return
        }
      }

      // Update local state
      setStatements({ ...editedStatements })
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving personal statements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedStatements({ ...statements })
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedStatements({ ...statements })
    setIsEditing(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Personal Compass</CardTitle>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
        <CardDescription>
          Define your personal mission, vision, values, and how you want to be remembered
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="mission" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Mission</span>
            </TabsTrigger>
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Vision</span>
            </TabsTrigger>
            <TabsTrigger value="values" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Values</span>
            </TabsTrigger>
            <TabsTrigger value="eulogy" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Eulogy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mission" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Personal Mission Statement</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your mission statement defines your purpose and what you want to accomplish in life.
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="mission">Your Mission Statement</Label>
                  <Textarea
                    id="mission"
                    value={editedStatements.mission}
                    onChange={(e) => setEditedStatements({ ...editedStatements, mission: e.target.value })}
                    placeholder="What is your purpose? What do you want to accomplish in life?"
                    rows={6}
                  />
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  {statements.mission ? (
                    <p className="whitespace-pre-wrap">{statements.mission}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      You haven't defined your mission statement yet. Click edit to add one.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vision" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Personal Vision</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your vision describes what you want your life to look like in the future.
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="vision">Your Vision</Label>
                  <Textarea
                    id="vision"
                    value={editedStatements.vision}
                    onChange={(e) => setEditedStatements({ ...editedStatements, vision: e.target.value })}
                    placeholder="What do you want your life to look like in 5-10 years?"
                    rows={6}
                  />
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  {statements.vision ? (
                    <p className="whitespace-pre-wrap">{statements.vision}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      You haven't defined your vision yet. Click edit to add one.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="values" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Core Values</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your core values are the principles that guide your decisions and actions.
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="values">Your Core Values</Label>
                  <Textarea
                    id="values"
                    value={editedStatements.values}
                    onChange={(e) => setEditedStatements({ ...editedStatements, values: e.target.value })}
                    placeholder="What principles guide your life? What do you stand for?"
                    rows={6}
                  />
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  {statements.values ? (
                    <p className="whitespace-pre-wrap">{statements.values}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      You haven't defined your core values yet. Click edit to add them.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="eulogy" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Eulogy Vision</h3>
              <p className="text-sm text-muted-foreground mb-4">
                How do you want to be remembered? What legacy do you want to leave behind?
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="eulogy">Your Eulogy Vision</Label>
                  <Textarea
                    id="eulogy"
                    value={editedStatements.eulogy}
                    onChange={(e) => setEditedStatements({ ...editedStatements, eulogy: e.target.value })}
                    placeholder="How do you want to be remembered? What legacy do you want to leave?"
                    rows={6}
                  />
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  {statements.eulogy ? (
                    <p className="whitespace-pre-wrap">{statements.eulogy}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      You haven't defined your eulogy vision yet. Click edit to add one.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

