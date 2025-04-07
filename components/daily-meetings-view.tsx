"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { CalendarDays, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { format, startOfWeek, endOfWeek, addDays, parseISO } from "date-fns"

interface Meeting {
  id: string
  title: string
  time?: string
  date: string
  duration: number
  description?: string
  user_id: string
  _location?: string
  _type?: string
  _color?: string
}

export default function DailyMeetingsView() {
  const { user } = useAuth()
  const router = useRouter()
  const [todayMeetings, setTodayMeetings] = useState<Meeting[]>([])
  const [weekMeetings, setWeekMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("today")

  useEffect(() => {
    async function fetchMeetings() {
      if (!user) return

      try {
        setLoading(true)

        // Check if the meetings table exists
        const { data: tableInfo, error: tableError } = await supabase.from("meetings").select("*").limit(1)

        if (tableError && tableError.message.includes("does not exist")) {
          console.log("Meetings table does not exist yet")
          setLoading(false)
          return
        }

        // Get today's date in YYYY-MM-DD format
        const today = format(new Date(), "yyyy-MM-dd")

        // Get start and end of current week
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

        // Format dates for query
        const weekStartStr = format(weekStart, "yyyy-MM-dd")
        const weekEndStr = format(weekEnd, "yyyy-MM-dd")

        // Query meetings for today
        const { data: todayData, error: todayError } = await supabase
          .from("meetings")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .order("time", { ascending: true })

        // Query meetings for this week
        const { data: weekData, error: weekError } = await supabase
          .from("meetings")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", weekStartStr)
          .lte("date", weekEndStr)
          .order("date", { ascending: true })
          .order("time", { ascending: true })

        if (todayError) {
          console.error("Error fetching today's meetings:", todayError)
          setTodayMeetings([])
        } else {
          // Process meetings to extract metadata from description
          const processedTodayMeetings = (todayData || []).map(processMeeting)
          setTodayMeetings(processedTodayMeetings)
        }

        if (weekError) {
          console.error("Error fetching week's meetings:", weekError)
          setWeekMeetings([])
        } else {
          // Process meetings to extract metadata from description
          const processedWeekMeetings = (weekData || []).map(processMeeting)
          // Filter out today's meetings from week view to avoid duplication
          const filteredWeekMeetings = processedWeekMeetings.filter((meeting) => meeting.date !== today)
          setWeekMeetings(filteredWeekMeetings)
        }
      } catch (error) {
        console.error("Error in fetchMeetings:", error)
        setTodayMeetings([])
        setWeekMeetings([])
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [user])

  // Process meeting to extract metadata from description
  const processMeeting = (meeting: Meeting): Meeting => {
    try {
      if (meeting.description) {
        const descriptionData = JSON.parse(meeting.description)
        return {
          ...meeting,
          _location: descriptionData.location || "",
          _type: descriptionData.type || "",
          _color: descriptionData.color || "",
          description: descriptionData.notes || "",
        }
      }
    } catch (e) {
      // If parsing fails, just return the meeting as is
    }
    return meeting
  }

  const navigateToMeetings = () => {
    router.push("/meetings")
  }

  // Format time for display
  const formatTime = (meeting: Meeting) => {
    if (meeting.time) {
      return format(parseISO(`${meeting.date}T${meeting.time}`), "h:mm a")
    }
    return "Time not specified"
  }

  // Format date for display in week view
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    const today = new Date()
    const tomorrow = addDays(today, 1)
    const yesterday = addDays(today, -1)

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today"
    } else if (format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) {
      return "Tomorrow"
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday"
    } else {
      return format(date, "EEE, MMM d")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-md">Meetings</CardTitle>
        <Button variant="ghost" size="sm" onClick={navigateToMeetings}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : todayMeetings.length > 0 ? (
              todayMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex flex-col p-2 border rounded-md"
                  style={meeting._color ? { borderLeftWidth: "4px", borderLeftColor: meeting._color } : {}}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{meeting.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{formatTime(meeting)}</span>
                  </div>
                  {meeting._location && <p className="text-xs text-muted-foreground mt-1">📍 {meeting._location}</p>}
                </div>
              ))
            ) : (
              <div className="text-center py-3">
                <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No meetings scheduled for today</p>
                <Button variant="link" size="sm" onClick={navigateToMeetings} className="mt-1">
                  Schedule a meeting
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="week" className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : weekMeetings.length > 0 ? (
              weekMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex flex-col p-2 border rounded-md"
                  style={meeting._color ? { borderLeftWidth: "4px", borderLeftColor: meeting._color } : {}}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{meeting.title}</h4>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                      {formatDate(meeting.date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(meeting)}
                      {meeting._location && ` • 📍 ${meeting._location}`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-3">
                <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No meetings scheduled for this week</p>
                <Button variant="link" size="sm" onClick={navigateToMeetings} className="mt-1">
                  Schedule a meeting
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

