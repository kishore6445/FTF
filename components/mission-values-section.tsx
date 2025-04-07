"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Edit2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export default function MissionValuesSection() {
  const { user } = useAuth()
  const [data, setData] = useState({
    mission: "",
    values: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({
    mission: "",
    values: "",
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("personal_statements")
        .select("mission, values")
        .eq("user_id", user?.id)
        .single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setData({
          mission: data.mission || "",
          values: data.values || "",
        })
        setEditedData({
          mission: data.mission || "",
          values: data.values || "",
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("personal_statements").upsert({
        user_id: user?.id,
        mission: editedData.mission,
        values: editedData.values,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setData(editedData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Mission Statement</CardTitle>
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
                value={editedData.mission}
                onChange={(e) => setEditedData({ ...editedData, mission: e.target.value })}
                placeholder="Write your mission statement..."
                className="min-h-[200px]"
              />
            </div>
          ) : (
            <div className="prose max-w-none">
              {data.mission ? (
                <p className="whitespace-pre-wrap">{data.mission}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  You haven't defined your mission statement yet. Click edit to add one.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Core Values</CardTitle>
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
                value={editedData.values}
                onChange={(e) => setEditedData({ ...editedData, values: e.target.value })}
                placeholder="Write your core values..."
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
              {data.values ? (
                <p className="whitespace-pre-wrap">{data.values}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  You haven't defined your core values yet. Click edit to add them.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

