"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Repeat, Award, Plus, Database, ChevronLeft, ChevronRight, Check, CheckCircle2, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isToday,
  isThisWeek,
  isYesterday,
  isThisMonth,
  startOfMonth,
  eachDayOfInterval,
  differenceInDays,
  endOfMonth,
} from "date-fns"
import { v4 as uuidv4 } from "uuid"

interface Ritual {
  id: string
  title: string
  description?: string
  time_of_day?: string
  category?: string
  days_of_week?: string[]
  user_id?: string
  created_at?: string
  updated_at?: string
  streak?: number
}

interface RitualCompletion {
  id: string
  ritual_id: string
  user_id: string
  date?: string
  [key: string]: any // Allow for dynamic date column
}

interface CompletedItem {
  id: string
  ritualId: string
  ritualTitle: string
  completedAt: Date
}

export default function DailyRitualStreak() {
  const { user } = useAuth()
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [completions, setCompletions] = useState<Record<string, Record<string, RitualCompletion>>>({})
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRitual, setNewRitual] = useState({
    title: "",
    description: "",
    timeOfDay: "morning",
    category: "general",
    daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tableExists, setTableExists] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedRitual, setSelectedRitual] = useState<string | null>(null)
  const [processingDate, setProcessingDate] = useState<string | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [monthlyStats, setMonthlyStats] = useState({ completed: 0, total: 0, percentage: 0 })
  const { toast } = useToast()

  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ]

  // Generate days for the streak view with month information
  const days = Array.from({ length: 30 }, (_, i) => {
    return subDays(new Date(), 29 - i)
  })

  // Group days by month for better organization
  const daysByMonth = days.reduce(
    (acc, day) => {
      const monthKey = format(day, "MMM yyyy")
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(day)
      return acc
    },
    {} as Record<string, Date[]>,
  )

  // Get dates for current month
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  useEffect(() => {
    if (user) {
      checkTableExists()
    }
  }, [user])

  useEffect(() => {
    if (rituals.length > 0) {
      // Check connection before fetching
      checkSupabaseConnection().then((connected) => {
        if (connected) {
          fetchCompletions()
        } else {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the database. Please check your internet connection.",
            variant: "destructive",
          })
        }
      })
    }
  }, [rituals])

  const checkTableExists = async () => {
    try {
      // Check if both tables exist
      const { data: ritualsData, error: ritualsError } = await supabase.from("rituals").select("id").limit(1)

      const { data: completionsData, error: completionsError } = await supabase
        .from("ritual_completions")
        .select("id")
        .limit(1)

      if ((ritualsError && ritualsError.code === "42P01") || (completionsError && completionsError.code === "42P01")) {
        // Table doesn't exist error code
        console.log("One or both ritual tables don't exist yet")
        setTableExists(false)
        setLoading(false)
        return false
      }

      setTableExists(true)
      fetchRituals()
      return true
    } catch (error) {
      console.error("Error checking if tables exist:", error)
      setTableExists(false)
      setLoading(false)
      return false
    }
  }

  const fetchRituals = async () => {
    if (!user || !tableExists) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("rituals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching rituals:", error)
        toast({
          title: "Error",
          description: "Failed to load rituals",
          variant: "destructive",
        })
        setRituals([])
      } else {
        setRituals(data || [])
        if (data && data.length > 0 && !selectedRitual) {
          setSelectedRitual(data[0].id)
        }
      }
    } catch (error) {
      console.error("Error in fetchRituals:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading rituals",
        variant: "destructive",
      })
      setRituals([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCompletions = async (retryCount = 0) => {
    if (!user || !tableExists || rituals.length === 0) return

    try {
      // Get the date range for the last 30 days
      const startDate = format(subDays(new Date(), 29), "yyyy-MM-dd")
      const endDate = format(new Date(), "yyyy-MM-dd")

      // Always use 'date' as the column name for consistency
      const dateColumnName = "date"

      // Add timeout to the fetch request
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

      // Create the actual query promise
      const queryPromise = supabase
        .from("ritual_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte(dateColumnName, startDate)
        .lte(dateColumnName, endDate + "T23:59:59")
        .order(dateColumnName, { ascending: false })

      // Race the query against the timeout
      const { data: completionsData, error: completionsError } = await Promise.race([
        queryPromise,
        timeoutPromise.then(() => {
          throw new Error("Request timeout")
        }),
      ])

      if (completionsError) {
        // If the table or column doesn't exist, show a clear error message
        if (completionsError.message.includes('relation "ritual_completions" does not exist')) {
          console.error("Error: The ritual_completions table doesn't exist.")
          toast({
            title: "Database Error",
            description: "The ritual_completions table doesn't exist. Please run the database setup SQL.",
            variant: "destructive",
          })
        } else if (completionsError.message.includes('column "date" does not exist')) {
          console.error("Error: The date column doesn't exist in the ritual_completions table.")
          toast({
            title: "Database Error",
            description:
              "The ritual_completions table is missing the 'date' column. Please check your database schema.",
            variant: "destructive",
          })
        } else {
          console.error("Error fetching completions:", completionsError)
          toast({
            title: "Error",
            description: "Failed to load ritual completions",
            variant: "destructive",
          })
        }
        return
      }

      // Get a list of valid ritual IDs from the rituals array
      const validRitualIds = rituals.map((ritual) => ritual.id)

      // Organize completions by ritual_id and date
      const completionsMap: Record<string, Record<string, RitualCompletion>> = {}

      rituals.forEach((ritual) => {
        completionsMap[ritual.id] = {}
      })

      // Create a list of completed items for the inbox
      const completedItemsList: CompletedItem[] = []

      if (completionsData) {
        // Filter out completions for rituals that no longer exist
        const validCompletions = completionsData.filter((completion) => validRitualIds.includes(completion.ritual_id))

        if (validCompletions.length < completionsData.length) {
          console.warn(
            `Filtered out ${completionsData.length - validCompletions.length} completions for non-existent rituals`,
          )
        }

        validCompletions.forEach((completion) => {
          // Use the 'date' column consistently
          const dateValue = completion[dateColumnName]
          const dateKey = dateValue ? dateValue.split("T")[0] : null

          if (dateKey) {
            if (!completionsMap[completion.ritual_id]) {
              completionsMap[completion.ritual_id] = {}
            }
            completionsMap[completion.ritual_id][dateKey] = completion

            // Find the ritual title
            const ritual = rituals.find((r) => r.id === completion.ritual_id)
            if (ritual) {
              completedItemsList.push({
                id: completion.id,
                ritualId: ritual.id,
                ritualTitle: ritual.title,
                completedAt: new Date(dateValue),
              })
            }
          }
        })
      }

      setCompletions(completionsMap)
      setCompletedItems(completedItemsList)

      // Calculate streaks for each ritual
      calculateStreaks(completionsMap, dateColumnName)
    } catch (error) {
      console.error("Error in fetchCompletions:", error)

      // Check if it's a network error and retry if needed
      const isNetworkError =
        error instanceof Error &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("Network") ||
          error.message.includes("timeout"))

      if (isNetworkError && retryCount < 3) {
        // Exponential backoff for retries
        const backoffTime = Math.pow(2, retryCount) * 1000
        console.log(`Network error, retrying in ${backoffTime}ms (attempt ${retryCount + 1}/3)`)

        toast({
          title: "Connection issue",
          description: `Retrying in ${backoffTime / 1000} seconds...`,
          variant: "warning",
        })

        // Retry after backoff
        setTimeout(() => fetchCompletions(retryCount + 1), backoffTime)
        return
      }

      // If we've exhausted retries or it's not a network error
      toast({
        title: "Error",
        description: isNetworkError
          ? "Network connection issue. Please check your internet connection."
          : "An unexpected error occurred while loading completions",
        variant: "destructive",
      })

      // Set empty data to avoid UI being stuck in loading state
      setCompletions({})
      setCompletedItems([])
    }
  }

  const checkSupabaseConnection = async () => {
    try {
      // Simple health check query
      const { data, error } = await supabase.from("rituals").select("count").limit(1)

      if (error) {
        console.error("Supabase connection check failed:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Supabase connection check error:", error)
      return false
    }
  }

  const calculateStreaks = (
    completionsMap: Record<string, Record<string, RitualCompletion>>,
    dateColumnName = "date",
  ) => {
    const updatedRituals = [...rituals]

    updatedRituals.forEach((ritual) => {
      const ritualCompletions = completionsMap[ritual.id] || {}
      let currentStreak = 0
      let date = new Date()

      // Check if today is completed
      const todayStr = format(date, "yyyy-MM-dd")
      const isTodayCompleted = !!ritualCompletions[todayStr]

      if (!isTodayCompleted) {
        // If today is not completed, check yesterday
        date = subDays(date, 1)
      }

      // Count consecutive days
      let checking = true
      while (checking) {
        const dateStr = format(date, "yyyy-MM-dd")
        if (ritualCompletions[dateStr]) {
          currentStreak++
          date = subDays(date, 1)
        } else {
          checking = false
        }
      }

      ritual.streak = currentStreak
    })

    setRituals(updatedRituals)
  }

  const handleAddRitual = async () => {
    if (!user) return

    if (!newRitual.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your ritual",
        variant: "destructive",
      })
      return
    }

    if (newRitual.daysOfWeek.length === 0) {
      toast({
        title: "Days required",
        description: "Please select at least one day of the week",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Let the database generate the UUID
      const now = new Date().toISOString()

      const { data: newRitualData, error } = await supabase
        .from("rituals")
        .insert({
          title: newRitual.title,
          description: newRitual.description || null,
          time_of_day: newRitual.timeOfDay,
          category: newRitual.category,
          days_of_week: newRitual.daysOfWeek,
          user_id: user.id,
          created_at: now,
          updated_at: now,
        })
        .select()

      if (error) {
        console.error("Error creating ritual:", error)
        toast({
          title: "Error",
          description: "Failed to create ritual. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Ritual created",
        description: "Your new ritual has been added",
      })

      // Reset form and close dialog
      setNewRitual({
        title: "",
        description: "",
        timeOfDay: "morning",
        category: "general",
        daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      })
      setIsAddDialogOpen(false)

      // Refresh rituals
      fetchRituals()
    } catch (error) {
      console.error("Error in handleAddRitual:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDayToggle = (day: string) => {
    setNewRitual((prev) => {
      const currentDays = [...prev.daysOfWeek]
      if (currentDays.includes(day)) {
        return { ...prev, daysOfWeek: currentDays.filter((d) => d !== day) }
      } else {
        return { ...prev, daysOfWeek: [...currentDays, day] }
      }
    })
  }

  const handleToggleCompletion = async (ritualId: string, date: Date) => {
    if (!user || !tableExists) return

    // Set the date we're processing to show loading state
    const dateStr = format(date, "yyyy-MM-dd")
    setProcessingDate(dateStr)

    console.log("handleToggleCompletion called with:", ritualId, dateStr)

    const isCompleted = completions[ritualId]?.[dateStr]

    console.log("Is this date already completed?", !!isCompleted)

    try {
      // Always use 'date' as the column name for consistency
      const dateColumnName = "date"

      if (isCompleted) {
        console.log("Deleting completion with ID:", isCompleted.id)
        // Delete the completion
        const { error } = await supabase.from("ritual_completions").delete().eq("id", isCompleted.id)

        if (error) {
          console.error("Error deleting completion:", error)
          toast({
            title: "Error",
            description: "Failed to update ritual status",
            variant: "destructive",
          })
          return
        }

        // Update local state
        const newCompletions = { ...completions }
        delete newCompletions[ritualId][dateStr]
        setCompletions(newCompletions)

        // Update completed items list
        setCompletedItems((prev) => prev.filter((item) => item.id !== isCompleted.id))

        toast({
          title: "Ritual marked as incomplete",
          description: `Removed completion for ${format(date, "MMM d, yyyy")}`,
        })

        // Recalculate streaks
        calculateStreaks(newCompletions, dateColumnName)
      } else {
        // First, verify that the ritual exists in the database
        console.log("Checking if ritual exists with ID:", ritualId)
        const { data: ritualData, error: ritualError } = await supabase
          .from("rituals")
          .select("id, title")
          .eq("id", ritualId)
          .single()

        if (ritualError || !ritualData) {
          console.error("Error: Ritual does not exist in database:", ritualId, ritualError)
          toast({
            title: "Error",
            description: "The ritual you're trying to update doesn't exist in the database.",
            variant: "destructive",
          })

          // Refresh rituals to ensure we have the latest data
          fetchRituals()
          return
        }

        console.log("Found ritual in database:", ritualData)

        // Create a new completion
        const completionDate = new Date(date)
        completionDate.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues

        const formattedDate = format(completionDate, "yyyy-MM-dd") + "T12:00:00"

        console.log("Adding completion for ritual_id:", ritualData.id, "date:", formattedDate)

        // Try using the new safely_add_ritual_completion function
        const { data: safeData, error: safeError } = await supabase.rpc("safely_add_ritual_completion", {
          p_ritual_id: ritualData.id,
          p_user_id: user.id,
          p_date: formattedDate,
        })

        if (safeError || (safeData && !safeData.success)) {
          console.log("Safe function failed, trying direct insert:", safeError || safeData?.error)

          // If the function doesn't exist or fails, try direct insert
          // First check if a completion already exists for this date
          const { data: existingData, error: existingError } = await supabase
            .from("ritual_completions")
            .select("id")
            .eq("ritual_id", ritualData.id)
            .eq("user_id", user.id)
            .eq("date::date", dateStr)
            .maybeSingle()

          if (existingData) {
            console.log("Found existing completion:", existingData)

            // Use the existing completion
            const completionData = {
              id: existingData.id,
              ritual_id: ritualData.id,
              user_id: user.id,
              date: formattedDate,
            }

            // Update local state
            const newCompletions = { ...completions }
            if (!newCompletions[ritualId]) {
              newCompletions[ritualId] = {}
            }
            newCompletions[ritualId][dateStr] = completionData
            setCompletions(newCompletions)

            // Add to completed items if not already there
            if (!completedItems.some((item) => item.id === existingData.id)) {
              setCompletedItems((prev) => [
                {
                  id: existingData.id,
                  ritualId: ritualData.id,
                  ritualTitle: ritualData.title,
                  completedAt: completionDate,
                },
                ...prev,
              ])
            }

            toast({
              title: "Ritual completed",
              description: `Marked as complete for ${format(date, "MMM d, yyyy")}`,
            })

            // Recalculate streaks
            calculateStreaks(newCompletions, dateColumnName)
            return
          }

          // No existing completion, create a new one with a direct insert
          const completionId = uuidv4()
          const insertData = {
            id: completionId,
            ritual_id: ritualData.id,
            user_id: user.id,
            [dateColumnName]: formattedDate,
          }

          console.log("Inserting new completion with data:", insertData)

          const { data: insertData2, error: insertError } = await supabase
            .from("ritual_completions")
            .insert(insertData)
            .select()

          if (insertError) {
            console.error("Error with direct insert:", insertError)

            // If we get a foreign key constraint error, try one more approach
            if (insertError.message.includes("foreign key constraint")) {
              console.log("Foreign key constraint error, trying raw SQL insert")

              // Try a raw SQL insert as a last resort
              const { data: rawData, error: rawError } = await supabase.rpc("execute_sql", {
                sql_query: `
                  INSERT INTO ritual_completions (id, ritual_id, user_id, date)
                  SELECT 
                    '${completionId}'::uuid, 
                    r.id, 
                    '${user.id}'::uuid, 
                    '${formattedDate}'::timestamptz
                  FROM rituals r
                  WHERE r.id = '${ritualData.id}'::uuid
                  RETURNING id, ritual_id, user_id, date;
                `,
              })

              if (rawError) {
                console.error("Raw SQL insert failed:", rawError)
                toast({
                  title: "Error",
                  description: "Failed to update ritual status after multiple attempts. Please try again later.",
                  variant: "destructive",
                })
                return
              }

              // Use the raw SQL result
              const completionData = {
                id: completionId,
                ritual_id: ritualData.id,
                user_id: user.id,
                date: formattedDate,
              }

              // Update local state
              const newCompletions = { ...completions }
              if (!newCompletions[ritualId]) {
                newCompletions[ritualId] = {}
              }
              newCompletions[ritualId][dateStr] = completionData
              setCompletions(newCompletions)

              // Add to completed items
              setCompletedItems((prev) => [
                {
                  id: completionId,
                  ritualId: ritualData.id,
                  ritualTitle: ritualData.title,
                  completedAt: completionDate,
                },
                ...prev,
              ])

              toast({
                title: "Ritual completed",
                description: `Marked as complete for ${format(date, "MMM d, yyyy")}`,
              })

              // Recalculate streaks
              calculateStreaks(newCompletions, dateColumnName)
              return
            }

            toast({
              title: "Error",
              description: "Failed to update ritual status: " + insertError.message,
              variant: "destructive",
            })
            return
          }

          if (!insertData2 || insertData2.length === 0) {
            console.error("No data returned from insert operation")
            toast({
              title: "Error",
              description: "Failed to create completion record",
              variant: "destructive",
            })
            return
          }

          // Use the inserted data
          const completionData = insertData2[0]

          // Update local state
          const newCompletions = { ...completions }
          if (!newCompletions[ritualId]) {
            newCompletions[ritualId] = {}
          }
          newCompletions[ritualId][dateStr] = completionData
          setCompletions(newCompletions)

          // Add to completed items
          setCompletedItems((prev) => [
            {
              id: completionData.id,
              ritualId: ritualData.id,
              ritualTitle: ritualData.title,
              completedAt: completionDate,
            },
            ...prev,
          ])

          toast({
            title: "Ritual completed",
            description: `Marked as complete for ${format(date, "MMM d, yyyy")}`,
          })

          // Recalculate streaks
          calculateStreaks(newCompletions, dateColumnName)
          return
        }

        // If we get here, the safely_add_ritual_completion function worked
        console.log("Successfully created completion with safe function:", safeData)

        // Extract the completion data
        const completionData = {
          id: safeData.id,
          ritual_id: safeData.ritual_id,
          user_id: safeData.user_id,
          date: safeData.date,
        }

        // Update local state
        const newCompletions = { ...completions }
        if (!newCompletions[ritualId]) {
          newCompletions[ritualId] = {}
        }
        newCompletions[ritualId][dateStr] = completionData
        setCompletions(newCompletions)

        // Add to completed items
        setCompletedItems((prev) => [
          {
            id: completionData.id,
            ritualId: ritualData.id,
            ritualTitle: ritualData.title,
            completedAt: completionDate,
          },
          ...prev,
        ])

        toast({
          title: "Ritual completed",
          description: `Marked as complete for ${format(date, "MMM d, yyyy")}`,
        })

        // Recalculate streaks
        calculateStreaks(newCompletions, dateColumnName)
      }
    } catch (error) {
      console.error("Error in handleToggleCompletion:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      // Clear the processing date
      setProcessingDate(null)
    }
  }

  // Format the relative time for completed items
  const formatRelativeTime = (date: Date) => {
    if (isToday(date)) {
      return "Today"
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else if (isThisWeek(date)) {
      return format(date, "EEEE") // Day name
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  // Handle database setup completion
  const handleDatabaseSetupComplete = () => {
    setTableExists(true)
    fetchRituals()
  }

  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => subDays(prevDate, 30))
  }

  const handleNextMonth = () => {
    const nextDate = addDays(currentDate, 30)
    if (isSameDay(nextDate, new Date()) || nextDate < new Date()) {
      setCurrentDate(nextDate)
    }
  }

  const isDateCompleted = (ritualId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return !!completions[ritualId]?.[dateStr]
  }

  const getSelectedRitual = () => {
    return rituals.find((ritual) => ritual.id === selectedRitual)
  }

  // Check if a date should be active based on the ritual's days of week
  const isDateActive = (date: Date, ritual?: Ritual) => {
    if (!ritual || !ritual.days_of_week || ritual.days_of_week.length === 0) return true

    const dayName = format(date, "EEEE").toLowerCase()
    return ritual.days_of_week.includes(dayName)
  }

  // Check if a date is currently being processed
  const isDateProcessing = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return processingDate === dateStr
  }

  // Helper function to get the next milestone
  const getNextMilestone = (currentStreak: number): number => {
    const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365]
    return milestones.find((milestone) => milestone > currentStreak) || Math.ceil(currentStreak / 100) * 100
  }

  // Calculate completion rate for the current month
  const calculateCompletionRate = (ritualId: string): number => {
    if (!ritualId) return 0

    const ritual = rituals.find((r) => r.id === ritualId)
    if (!ritual || !ritual.days_of_week || ritual.days_of_week.length === 0) return 0

    const today = new Date()
    const startOfMonthValue = startOfMonth(today)
    const daysInMonth = eachDayOfInterval({ start: startOfMonthValue, end: today })

    // Filter days that match the ritual's days_of_week
    const scheduledDays = daysInMonth.filter((day) => {
      const dayName = format(day, "EEEE").toLowerCase()
      return ritual.days_of_week.includes(dayName)
    })

    if (scheduledDays.length === 0) return 0

    // Count completed days
    const completedDays = scheduledDays.filter((day) => {
      const dateStr = format(day, "yyyy-MM-dd")
      return !!completions[ritualId]?.[dateStr]
    })

    return Math.round((completedDays.length / scheduledDays.length) * 100)
  }

  // Determine the next milestone
  const getNextMilestone2 = (streak: number) => {
    const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365]
    return milestones.find((m) => m > streak) || streak + 1
  }

  const nextMilestone = getNextMilestone2(currentStreak)
  const progressToNextMilestone = Math.min(Math.round((currentStreak / nextMilestone) * 100), 100)

  // Check if a date has a completion
  const hasCompletion = (date: Date) => {
    return Object.values(completions).some((ritualCompletions) => {
      return Object.values(ritualCompletions).some((completion: any) => {
        const completionDate = new Date(completion.date)
        return isSameDay(completionDate, date)
      })
    })
  }

  const calculateStreaks2 = () => {
    // Sort completions by date (newest first)
    const allCompletions = Object.values(completions).flatMap((ritualCompletions) => Object.values(ritualCompletions))
    const sortedCompletions = [...allCompletions].sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    // Group completions by date
    const completionsByDate = sortedCompletions.reduce((acc: Record<string, any[]>, completion: any) => {
      const date = completion.date
      if (!acc[date]) acc[date] = []
      acc[date].push(completion)
      return acc
    }, {})

    // Get unique dates with completions
    const completionDates = Object.keys(completionsByDate).map((date) => new Date(date))

    // Calculate current streak
    let streak = 0
    let date = new Date()

    // Check if there's a completion for today
    const todayStr = format(date, "yyyy-MM-dd")
    const hasTodayCompletion = completionsByDate[todayStr]

    // If no completion today, start checking from yesterday
    if (!hasTodayCompletion) {
      date = addDays(date, -1)
    }

    // Count consecutive days with completions
    while (true) {
      const dateStr = format(date, "yyyy-MM-dd")
      if (completionsByDate[dateStr]) {
        streak++
        date = addDays(date, -1)
      } else {
        break
      }
    }

    setCurrentStreak(streak)

    // Calculate longest streak
    let longestStreak = 0
    let currentLongestStreak = 0
    let prevDate: Date | null = null

    completionDates
      .sort((a, b) => a.getTime() - b.getTime())
      .forEach((date) => {
        if (prevDate === null) {
          currentLongestStreak = 1
        } else {
          const dayDiff = differenceInDays(date, prevDate)
          if (dayDiff === 1) {
            currentLongestStreak++
          } else {
            currentLongestStreak = 1
          }
        }

        longestStreak = Math.max(longestStreak, currentLongestStreak)
        prevDate = date
      })

    setLongestStreak(longestStreak)
  }

  const calculateMonthlyStats2 = () => {
    const monthStart = startOfMonth(new Date())
    const monthEnd = endOfMonth(new Date())

    // Get all completions
    const allCompletions = Object.values(completions).flatMap((ritualCompletions) => Object.values(ritualCompletions))

    // Get completions for current month
    const monthCompletions = allCompletions.filter((completion: any) => {
      const completionDate = new Date(completion.date)
      return completionDate >= monthStart && completionDate <= monthEnd
    })

    // Get unique dates with completions this month
    const uniqueDates = new Set(monthCompletions.map((c: any) => c.date))
    const completed = uniqueDates.size

    // Calculate percentage
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1
    const daysElapsed = Math.min(differenceInDays(new Date(), monthStart) + 1, daysInMonth)
    const percentage = daysElapsed > 0 ? Math.round((completed / daysElapsed) * 100) : 0

    setMonthlyStats({
      completed,
      total: daysElapsed,
      percentage,
    })
  }

  useEffect(() => {
    if (!user) return

    const fetchCompletions2 = async () => {
      setLoading(true)
      try {
        // Check if the ritual_completions table exists
        const { data: tableExists, error: tableCheckError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_name", "ritual_completions")
          .eq("table_schema", "public")
          .single()

        if (tableCheckError || !tableExists) {
          console.log("Ritual completions table doesn't exist yet")
          setCompletions({})
          setLoading(false)
          return
        }

        // Get the last 60 days of completions
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 60)

        const { data, error } = await supabase
          .from("ritual_completions")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", startDate.toISOString().split("T")[0])
          .order("date", { ascending: false })

        if (error) {
          console.error("Error fetching ritual completions:", error)
          return
        }

        // Organize completions by ritual_id and date
        const completionsMap: Record<string, Record<string, RitualCompletion>> = {}

        rituals.forEach((ritual) => {
          completionsMap[ritual.id] = {}
        })

        if (data) {
          data.forEach((completion) => {
            const dateValue = completion.date
            const dateKey = dateValue ? dateValue.split("T")[0] : null

            if (dateKey) {
              if (!completionsMap[completion.ritual_id]) {
                completionsMap[completion.ritual_id] = {}
              }
              completionsMap[completion.ritual_id][dateKey] = completion
            }
          })
        }

        setCompletions(completionsMap)

        // Calculate streaks
        calculateStreaks2()

        // Calculate monthly stats
        calculateMonthlyStats2()
      } catch (error) {
        console.error("Error in fetchCompletions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompletions2()
  }, [user, rituals])

  if (!tableExists) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Database className="h-5 w-5 mr-2 text-primary" />
            Database Setup Required
          </CardTitle>
          <CardDescription>
            The rituals database needs to be set up before you can track your daily rituals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Please run the following SQL in your Supabase SQL Editor to create the necessary tables:
          </p>
          <div className="bg-slate-100 p-4 rounded-md mb-4 text-sm overflow-auto max-h-60">
            <pre>{`
-- Create rituals table if it doesn't exist
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  category TEXT DEFAULT 'general',
  time_of_day TEXT DEFAULT 'morning',
  days_of_week TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rituals_user_id ON rituals(user_id);

-- Drop ritual_completions table if it exists to ensure clean state
DROP TABLE IF EXISTS ritual_completions;

-- Create ritual_completions table
CREATE TABLE ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ritual_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID NOT NULL,
  FOREIGN KEY (ritual_id) REFERENCES rituals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual_id ON ritual_completions(ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);

-- Create a function to safely add ritual completions
CREATE OR REPLACE FUNCTION safely_add_ritual_completion(
  p_ritual_id UUID,
  p_user_id UUID,
  p_date TIMESTAMP WITH TIME ZONE
) RETURNS JSONB AS $$
DECLARE
  v_ritual_exists BOOLEAN;
  v_completion_id UUID;
  v_result JSONB;
  v_existing_completion UUID;
BEGIN
  -- Check if the ritual exists
  SELECT EXISTS(SELECT 1 FROM rituals WHERE id = p_ritual_id) INTO v_ritual_exists;
  
  IF NOT v_ritual_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ritual does not exist',
      'ritual_id', p_ritual_id
    );
  END IF;
  
  -- Check if a completion already exists for this date and ritual
  SELECT id INTO v_existing_completion
  FROM ritual_completions
  WHERE ritual_id = p_ritual_id
    AND user_id = p_user_id
    AND date::date = p_date::date
  LIMIT 1;
  
  -- If it exists, return it
  IF v_existing_completion IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'id', v_existing_completion,
      'ritual_id', p_ritual_id,
      'user_id', p_user_id,
      'date', p_date,
      'message', 'Existing completion found'
    );
  END IF;
  
  -- Generate a new UUID for the completion
  v_completion_id := uuid_generate_v4();
  
  -- Insert the completion
  BEGIN
    INSERT INTO ritual_completions (id, ritual_id, user_id, date)
    VALUES (v_completion_id, p_ritual_id, p_user_id, p_date);
    
    RETURN jsonb_build_object(
      'success', true,
      'id', v_completion_id,
      'ritual_id', p_ritual_id,
      'user_id', p_user_id,
      'date', p_date,
      'message', 'New completion created'
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'ritual_id', p_ritual_id
    );
  END;
END;
$$ LANGUAGE plpgsql;
`}</pre>
          </div>
          <Button onClick={checkTableExists}>Check Again</Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Repeat className="h-5 w-5 mr-2 text-primary" />
            Daily Ritual Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-24">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Repeat className="h-5 w-5 mr-2 text-primary" />
              Daily Ritual Streaks
            </CardTitle>
            <CardDescription>Track your daily habits and build consistency</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Ritual
          </Button>
        </CardHeader>
        <CardContent>
          {rituals.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No rituals found. Start creating daily rituals to build streaks!</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create Your First Ritual
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Ritual selector and streak calendar */}
              <div className="md:col-span-2 space-y-6">
                {/* Ritual selector */}
                <div className="flex flex-wrap gap-2">
                  {rituals.map((ritual) => (
                    <Badge
                      key={ritual.id}
                      variant={selectedRitual === ritual.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedRitual(ritual.id)}
                    >
                      {ritual.title}
                      {ritual.streak && ritual.streak > 0 ? (
                        <span className="ml-1 bg-primary-foreground text-primary rounded-full px-1.5 py-0.5 text-xs">
                          {ritual.streak}
                        </span>
                      ) : null}
                    </Badge>
                  ))}
                </div>

                {selectedRitual && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{getSelectedRitual()?.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          <span className="font-bold">{getSelectedRitual()?.streak || 0}</span> day streak
                        </Badge>
                        {getSelectedRitual()?.streak && getSelectedRitual()?.streak >= 3 && (
                          <span className="text-lg" title="You're on fire!">
                            🔥
                          </span>
                        )}
                      </div>
                    </div>

                    {getSelectedRitual()?.description && (
                      <p className="text-sm text-muted-foreground">{getSelectedRitual()?.description}</p>
                    )}

                    {/* Streak progress visualization */}
                    {getSelectedRitual()?.streak && getSelectedRitual()?.streak > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Current streak</span>
                          <span>Next milestone: {getNextMilestone(getSelectedRitual()?.streak || 0)} days</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                            style={{
                              width: `${Math.min(100, ((getSelectedRitual()?.streak || 0) / getNextMilestone(getSelectedRitual()?.streak || 0)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Calendar streak view */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous</span>
                        </Button>
                        <h4 className="text-sm font-medium">Last 30 Days</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleNextMonth}
                          disabled={days[days.length - 1] >= new Date()}
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next</span>
                        </Button>
                      </div>

                      {/* Month-based calendar view */}
                      <div className="space-y-4">
                        {Object.entries(daysByMonth).map(([monthLabel, monthDays]) => (
                          <div key={monthLabel} className="space-y-1">
                            <h5 className="text-xs font-medium text-gray-500">{monthLabel}</h5>
                            <div className="flex flex-wrap gap-1 py-1">
                              {monthDays.map((day, index) => {
                                const isCompleted = isDateCompleted(selectedRitual, day)
                                const isActive = isDateActive(day, getSelectedRitual())
                                const isPast = day <= new Date()
                                const isProcessing = isDateProcessing(day)

                                // Find the day's position in the overall array for streak connections
                                const dayIndex = days.findIndex((d) => isSameDay(d, day))
                                const prevDayCompleted =
                                  dayIndex > 0 ? isDateCompleted(selectedRitual, days[dayIndex - 1]) : false
                                const nextDayCompleted =
                                  dayIndex < days.length - 1
                                    ? isDateCompleted(selectedRitual, days[dayIndex + 1])
                                    : false
                                const isPartOfStreak = isCompleted && (prevDayCompleted || nextDayCompleted)

                                return (
                                  <div key={day.toISOString()} className="relative flex flex-col items-center">
                                    {/* Streak connector lines */}
                                    {dayIndex > 0 && isCompleted && prevDayCompleted && (
                                      <div className="absolute left-0 top-1/2 w-1/2 h-0.5 bg-green-500 -translate-y-1/2 -translate-x-1/2 z-0"></div>
                                    )}
                                    {dayIndex < days.length - 1 && isCompleted && nextDayCompleted && (
                                      <div className="absolute right-0 top-1/2 w-1/2 h-0.5 bg-green-500 -translate-y-1/2 translate-x-1/2 z-0"></div>
                                    )}

                                    {/* Day circle */}
                                    <button
                                      className={`
                                        relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs
                                        ${
                                          isProcessing
                                            ? "bg-yellow-100 text-yellow-800 animate-pulse"
                                            : isCompleted
                                              ? "bg-green-500 text-white hover:bg-green-600"
                                              : isActive && isPast
                                                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                : "bg-gray-50 text-gray-400"
                                        }
                                        ${isToday(day) ? "ring-2 ring-primary ring-offset-2" : ""}
                                        ${isActive && isPast && !isProcessing ? "cursor-pointer" : "cursor-default opacity-50"}
                                        transition-all
                                      `}
                                      onClick={() => {
                                        if (isActive && isPast && selectedRitual && !isProcessing) {
                                          handleToggleCompletion(selectedRitual, day)
                                        }
                                      }}
                                      disabled={!isActive || !isPast || !selectedRitual || isProcessing}
                                      aria-label={`${format(day, "MMMM d, yyyy")} ${isCompleted ? "completed" : "not completed"}`}
                                    >
                                      {isProcessing ? <span className="animate-spin">⟳</span> : format(day, "d")}
                                      {isCompleted && !isProcessing && (
                                        <Check className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 text-white rounded-full p-0.5" />
                                      )}
                                    </button>

                                    {/* Day label */}
                                    <span className="text-[10px] text-gray-500 mt-1">{format(day, "EEE")}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-100 mr-1"></div>
                        <span>Not Completed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-50 opacity-50 mr-1"></div>
                        <span>Not Scheduled</span>
                      </div>
                    </div>

                    {/* Monthly statistics */}
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3">Monthly Statistics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">This Month</p>
                          <p className="text-lg font-semibold">
                            {selectedRitual &&
                              Object.entries(completions[selectedRitual] || {}).filter(([dateStr]) =>
                                isThisMonth(new Date(dateStr)),
                              ).length}
                            <span className="text-xs text-gray-500 ml-1">days</span>
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Completion Rate</p>
                          <p className="text-lg font-semibold">
                            {selectedRitual && calculateCompletionRate(selectedRitual)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Completed items inbox */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Completed Items
                  </h3>
                  <Badge variant="outline" className="font-normal">
                    {completedItems.length} items
                  </Badge>
                </div>

                {completedItems.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground text-sm">No completed rituals yet</p>
                    <p className="text-xs text-gray-400 mt-1">Complete a ritual to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{item.ritualTitle}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatRelativeTime(item.completedAt)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleToggleCompletion(item.ritualId, item.completedAt)}
                          disabled={processingDate !== null}
                        >
                          <span className="sr-only">Remove</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400 hover:text-red-500"
                          >
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Today</p>
                      <p className="text-lg font-semibold">
                        {completedItems.filter((item) => isToday(item.completedAt)).length}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">This Week</p>
                      <p className="text-lg font-semibold">
                        {completedItems.filter((item) => isThisWeek(item.completedAt)).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Ritual Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Ritual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newRitual.title}
                onChange={(e) => setNewRitual({ ...newRitual, title: e.target.value })}
                placeholder="Morning meditation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newRitual.description}
                onChange={(e) => setNewRitual({ ...newRitual, description: e.target.value })}
                placeholder="10 minutes of mindfulness to start the day"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Time of Day</Label>
              <Select
                value={newRitual.timeOfDay}
                onValueChange={(value) => setNewRitual({ ...newRitual, timeOfDay: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newRitual.category}
                onValueChange={(value) => setNewRitual({ ...newRitual, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="grid grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={newRitual.daysOfWeek.includes(day.id)}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <Label htmlFor={day.id}>{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRitual} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Ritual"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

