"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Save, Plus, X, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ScheduleItem {
  id: string
  time: string
  task: string
  userId: string
  date: string
}

export default function HourlySchedulePlanner() {
  const { toast } = useToast()
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [tableExists, setTableExists] = useState(true)

  // Generate time slots from 6 AM to 10 PM
  const timeSlots = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"]

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetchScheduleItems()
  }, [])

  const fetchScheduleItems = async () => {
    try {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        toast({
          title: "Authentication error",
          description: "Please log in to view your schedule",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Check if table exists
      const { error: tableCheckError } = await supabase.from("daily_schedule").select("id").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        console.warn("daily_schedule table doesn't exist yet")
        setTableExists(false)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("daily_schedule")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("date", today)
        .order("time", { ascending: true })

      if (error) throw error

      // Map database results to our interface
      const items = data.map((item) => ({
        id: item.id,
        time: item.time,
        task: item.task,
        userId: item.user_id,
        date: item.date,
      }))

      setScheduleItems(items)
    } catch (error) {
      console.error("Error fetching schedule:", error)
      toast({
        title: "Error",
        description: "Failed to load your schedule",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (timeSlot: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      // Check if an item already exists for this time slot
      const existingItem = scheduleItems.find((item) => item.time === timeSlot)

      if (existingItem) {
        // If it exists, set it to editing mode
        setEditingId(existingItem.id)
        setEditText(existingItem.task)
      } else {
        // If it doesn't exist, create a new empty item
        const newItem: ScheduleItem = {
          id: uuidv4(),
          time: timeSlot,
          task: "",
          userId: userData.user.id,
          date: today,
        }

        setScheduleItems([...scheduleItems, newItem])
        setEditingId(newItem.id)
        setEditText("")
      }
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      })
    }
  }

  const handleSaveTask = async () => {
    if (!editingId) return

    try {
      setSaving(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const itemToUpdate = scheduleItems.find((item) => item.id === editingId)
      if (!itemToUpdate) return

      // Update local state
      const updatedItems = scheduleItems.map((item) => (item.id === editingId ? { ...item, task: editText } : item))

      // Save to database if table exists
      if (tableExists) {
        const { error } = await supabase.from("daily_schedule").upsert({
          id: itemToUpdate.id,
          time: itemToUpdate.time,
          task: editText,
          user_id: userData.user.id,
          date: today,
        })

        if (error) throw error
      }

      setScheduleItems(updatedItems)
      setEditingId(null)
      setEditText("")

      toast({
        title: "Schedule updated",
        description: tableExists
          ? "Your schedule has been saved"
          : "Your schedule has been saved locally (table missing)",
      })
    } catch (error) {
      console.error("Error saving task:", error)
      toast({
        title: "Error",
        description: "Failed to save your schedule",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    // If it's a new item with no text, remove it
    if (editingId) {
      const item = scheduleItems.find((item) => item.id === editingId)
      if (item && !item.task) {
        setScheduleItems(scheduleItems.filter((item) => item.id !== editingId))
      }
    }

    setEditingId(null)
    setEditText("")
  }

  const handleClearTask = async (id: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      // Update local state
      const updatedItems = scheduleItems.map((item) => (item.id === id ? { ...item, task: "" } : item))

      // Find the item to update
      const itemToUpdate = scheduleItems.find((item) => item.id === id)
      if (!itemToUpdate) return

      // Save to database if table exists
      if (tableExists) {
        const { error } = await supabase.from("daily_schedule").upsert({
          id: itemToUpdate.id,
          time: itemToUpdate.time,
          task: "",
          user_id: userData.user.id,
          date: today,
        })

        if (error) throw error
      }

      setScheduleItems(updatedItems)

      toast({
        title: "Task cleared",
        description: "The task has been removed from your schedule",
      })
    } catch (error) {
      console.error("Error clearing task:", error)
      toast({
        title: "Error",
        description: "Failed to clear the task",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {!tableExists && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Database table not found. Changes will only be saved locally.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {timeSlots.map((timeSlot) => {
          const scheduleItem = scheduleItems.find((item) => item.time === timeSlot)
          const isEditing = scheduleItem && editingId === scheduleItem.id

          return (
            <div key={timeSlot} className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/10 group">
              <div className="w-16 font-medium text-sm pt-2">{timeSlot}</div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="What's your plan for this time?"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={saving}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSaveTask} disabled={saving}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : scheduleItem?.task ? (
                  <div
                    className="min-h-[2.5rem] p-2 rounded-md bg-accent/5 flex justify-between items-start"
                    onClick={() => {
                      setEditingId(scheduleItem.id)
                      setEditText(scheduleItem.task)
                    }}
                  >
                    <span>{scheduleItem.task}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearTask(scheduleItem.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground h-10"
                    onClick={() => handleAddTask(timeSlot)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add task
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

