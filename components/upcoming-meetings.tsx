"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, Clock, MapPin, Plus } from "lucide-react"
import { format, parseISO } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Interface that matches the actual database schema
interface Meeting {
  id: string
  title: string
  date: string
  time: string
  description: string
  duration: number
  // Client-side only properties extracted from description
  _location?: string
  _type?: "standup" | "client" | "review" | "other"
  _color?: string
}

interface AddMeetingFormData {
  title: string
  date: string
  time: string
  location: string
  type: "standup" | "client" | "review" | "other"
  description: string
  duration: number
  color: string
}

// Predefined color options
const colorOptions = [
  { value: "#3B82F6", label: "Blue", className: "bg-blue-500" },
  { value: "#EF4444", label: "Red", className: "bg-red-500" },
  { value: "#10B981", label: "Green", className: "bg-green-500" },
  { value: "#F59E0B", label: "Amber", className: "bg-amber-500" },
  { value: "#8B5CF6", label: "Purple", className: "bg-purple-500" },
  { value: "#EC4899", label: "Pink", className: "bg-pink-500" },
  { value: "#6B7280", label: "Gray", className: "bg-gray-500" },
]

export function UpcomingMeetings() {
  const { user } = useAuth()
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [formData, setFormData] = useState<AddMeetingFormData>({
    title: "",
    date: "",
    time: "",
    location: "",
    type: "other",
    description: "",
    duration: 30,
    color: "#3B82F6", // Default to blue
  })

  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchMeetings()
    }
  }, [user])

  // Set default color based on meeting type
  useEffect(() => {
    if (formData.type === "standup") {
      setFormData((prev) => ({ ...prev, color: "#3B82F6" })) // Blue
    } else if (formData.type === "client") {
      setFormData((prev) => ({ ...prev, color: "#EF4444" })) // Red
    } else if (formData.type === "review") {
      setFormData((prev) => ({ ...prev, color: "#10B981" })) // Green
    }
  }, [formData.type])

  const fetchMeetings = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .order("time", { ascending: true })

      if (error) throw error

      // Parse the description field to extract metadata
      const processedMeetings = data.map((meeting) => {
        let _location = ""
        let _type: "standup" | "client" | "review" | "other" = "other"
        let _color = ""

        try {
          // Try to parse JSON from description
          const descriptionData = JSON.parse(meeting.description)
          _location = descriptionData.location || ""
          _type = descriptionData.type || "other"
          _color = descriptionData.color || ""

          // Return meeting with extracted data
          return {
            ...meeting,
            _location,
            _type,
            _color,
            // Keep the original description for other uses
            description: descriptionData.notes || "",
          }
        } catch (e) {
          // If parsing fails, just use the description as is
          return {
            ...meeting,
            _location: "",
            _type: "other",
            _color: "",
          }
        }
      })

      setMeetings(processedMeetings)
    } catch (error) {
      console.error("Error fetching meetings:", error)
    }
  }

  const handleAddMeeting = async () => {
    if (!user) return

    try {
      // Store metadata in the description field as JSON
      const descriptionData = {
        location: formData.location,
        type: formData.type,
        color: formData.color,
        notes: formData.description,
      }

      const newMeeting = {
        id: uuidv4(),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        // Store the metadata in the description field
        description: JSON.stringify(descriptionData),
        user_id: user.id,
      }

      const { error } = await supabase.from("meetings").insert([newMeeting])

      if (error) throw error

      // Refresh meetings list
      await fetchMeetings()

      // Reset form and close dialog
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        type: "other",
        description: "",
        duration: 30,
        color: "#3B82F6",
      })
      setIsAddMeetingOpen(false)
    } catch (error) {
      console.error("Error adding meeting:", error)
    }
  }

  const getTypeColor = (meeting: Meeting) => {
    // Use custom color if available
    if (meeting._color) {
      return `border-l-4 border-l-[${meeting._color}]`
    }

    // Fall back to type-based colors
    switch (meeting._type) {
      case "standup":
        return "border-l-4 border-blue-500"
      case "client":
        return "border-l-4 border-red-500"
      case "review":
        return "border-l-4 border-green-500"
      default:
        return "border-l-4 border-gray-500"
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = parseISO(`${date}T${time}`)
    return {
      date: format(dateObj, "EEE, MMM d"),
      time: format(dateObj, "h:mm a"),
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <h3 className="text-xl font-bold">Upcoming Meetings</h3>
        </div>
        <Button onClick={() => setIsAddMeetingOpen(true)} variant="default" size="sm" className="bg-black text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.map((meeting) => {
          const { date, time } = formatDateTime(meeting.date, meeting.time)
          return (
            <div
              key={meeting.id}
              className={`p-3 bg-white rounded-lg border ${getTypeColor(meeting)} hover:shadow transition-shadow`}
              style={meeting._color ? { borderLeftColor: meeting._color } : {}}
            >
              <h4 className="font-medium">{meeting.title}</h4>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>{date}</span>
                  <Clock className="h-3.5 w-3.5 ml-2" />
                  <span>{time}</span>
                </div>
                {meeting._location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{meeting._location}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <Button variant="ghost" className="w-full justify-center text-primary" onClick={() => router.push("/meetings")}>
          View All Meetings
        </Button>
      </CardContent>

      <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter meeting title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Meeting Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as AddMeetingFormData["type"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standup">Team Standup</SelectItem>
                  <SelectItem value="client">Client Meeting</SelectItem>
                  <SelectItem value="review">Code Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meeting Color</Label>
              <RadioGroup
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
                className="flex flex-wrap gap-2"
              >
                {colorOptions.map((color) => (
                  <div key={color.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={color.value} id={`color-${color.value}`} className="sr-only" />
                    <Label
                      htmlFor={`color-${color.value}`}
                      className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center ${
                        formData.color === color.value ? "ring-2 ring-offset-2 ring-black" : ""
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${color.className}`} title={color.label} />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter meeting location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Notes</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter meeting notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMeetingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMeeting}>Add Meeting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

