"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Edit2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export default function VisionSection() {
  const { user } = useAuth()
  const [vision, setVision] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedVision, setEditedVision] = useState("")

  useEffect(() => {
    if (user) {
      fetchVision()
    }
  }, [user])

  const fetchVision = async () => {
    try {
      const { data, error } = await supabase
        .from("personal_statements")
        .select("vision")
        .eq("user_id", user?.id)
        .single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setVision(data.vision || "")
        setEditedVision(data.vision || "")
      }
    } catch (error) {
      console.error("Error fetching vision:", error)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("personal_statements").upsert({
        user_id: user?.id,
        vision: editedVision,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setVision(editedVision)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving vision:", error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Personal Vision</CardTitle>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedVision}
              onChange={(e) => setEditedVision(e.target.value)}
              placeholder="Write your personal vision statement..."
              className="min-h-[200px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            {vision ? (
              <p className="whitespace-pre-wrap">{vision}</p>
            ) : (
              <p className="text-muted-foreground italic">
                You haven't defined your vision statement yet. Click edit to add one.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

