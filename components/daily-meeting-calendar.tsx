"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
}

interface DailyMeetingCalendarProps {
  userId?: string
}

export function DailyMeetingCalendar({ userId }: DailyMeetingCalendarProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch meetings from Supabase
  useEffect(() => {
    if (!userId) return

    const fetchMeetings = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("meetings")
          .select("*")
          .eq("user_id", userId)
          .eq("date", format(date, "yyyy-MM-dd"))
          .order("time", { ascending: true })

        if (error) throw error

        if (data) {
          setMeetings(data as Meeting[])
        }
      } catch (error) {
        console.error("Error fetching meetings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetings()
  }, [userId, date])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CardTitle className="text-base">{format(date, "EEE, MMM d")}</CardTitle>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Meeting
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-sm text-muted-foreground">Meetings for {format(date, "MMMM d, yyyy")}</h3>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : meetings.length > 0 ? (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <p className="font-medium">{meeting.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.time} ({meeting.duration} min)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No meetings scheduled for this day</p>
              <p className="text-xs mt-1">Click "Add Meeting" to schedule a meeting</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

