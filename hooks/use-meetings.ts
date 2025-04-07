"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  description: string
  duration: number
  _location?: string
  _type?: "standup" | "client" | "review" | "other"
  _color?: string
}

export function useMeetings() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])

  useEffect(() => {
    if (user) {
      fetchMeetings()
    }
  }, [user])

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
          const descriptionData = JSON.parse(meeting.description)
          _location = descriptionData.location || ""
          _type = descriptionData.type || "other"
          _color = descriptionData.color || ""

          return {
            ...meeting,
            _location,
            _type,
            _color,
            description: descriptionData.notes || "",
          }
        } catch (e) {
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

  const addMeeting = async (meeting: Omit<Meeting, "id">) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("meetings")
        .insert([
          {
            user_id: user.id,
            title: meeting.title,
            date: meeting.date,
            time: meeting.time,
            duration: meeting.duration,
            description: meeting.description,
          },
        ])
        .select()

      if (error) throw error

      await fetchMeetings()
      return data
    } catch (error) {
      console.error("Error adding meeting:", error)
      throw error
    }
  }

  const updateMeeting = async (meeting: Meeting) => {
    if (!user) return

    try {
      const { error } = await supabase.from("meetings").update(meeting).eq("id", meeting.id).eq("user_id", user.id)

      if (error) throw error

      await fetchMeetings()
    } catch (error) {
      console.error("Error updating meeting:", error)
    }
  }

  const deleteMeeting = async (meetingId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("meetings").delete().eq("id", meetingId).eq("user_id", user.id)

      if (error) throw error

      await fetchMeetings()
    } catch (error) {
      console.error("Error deleting meeting:", error)
    }
  }

  return {
    meetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    refreshMeetings: fetchMeetings,
  }
}

