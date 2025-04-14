"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, isToday } from "date-fns"
import {
  Target,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Save,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  LifeBuoy,
  Rocket,
  Loader2,
  Database,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MoreVertical,
  Edit,
  ArrowRight,
  AlarmClock,
  BookOpen,
  Heart,
  Users,
  Home,
  BriefcaseIcon,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Role } from "@/lib/types"

interface WeeklyPlan {
  id: string
  userId: string
  weekStartDate: string
  weekEndDate: string
  theme?: string
  reflection?: string
  createdAt: string
  updatedAt: string
}

interface BigRock {
  id: string
  weeklyPlanId: string
  userId: string
  title: string
  description?: string
  roleId?: string
  quadrant?: string
  priority: number
  completed: boolean
  taskId?: string
  createdAt: string
  updatedAt: string
}

interface DailyPlan {
  id: string
  weeklyPlanId: string
  userId: string
  date: string
  morningReview?: string
  eveningReflection?: string
  createdAt: string
  updatedAt: string
}

interface TimeBlock {
  id: string
  dailyPlanId: string
  userId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  category?: string
  completed: boolean
  taskId?: string
  createdAt: string
  updatedAt: string
}

interface EnhancedWeeklyPlannerProps {
  roles?: Role[]
}

export default function EnhancedWeeklyPlanner({ roles = [] }: EnhancedWeeklyPlannerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)
  const [setupInProgress, setSetupInProgress] = useState(false)

  // Weekly plan state
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null)
  const [weekTheme, setWeekTheme] = useState("")
  const [reflection, setReflection] = useState("")
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Big rocks state
  const [bigRocks, setBigRocks] = useState<BigRock[]>([])
  const [isAddRockDialogOpen, setIsAddRockDialogOpen] = useState(false)
  const [isEditRockDialogOpen, setIsEditRockDialogOpen] = useState(false)
  const [editingRock, setEditingRock] = useState<BigRock | null>(null)
  const [newRock, setNewRock] = useState({
    title: "",
    description: "",
    roleId: "",
    quadrant: "q2",
    priority: 1,
    createTask: true,
  })

  // Daily plans state
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDailyPlan, setSelectedDailyPlan] = useState<DailyPlan | null>(null)
  const [morningReview, setMorningReview] = useState("")
  const [eveningReflection, setEveningReflection] = useState("")

  // Time blocks state
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [isAddTimeBlockDialogOpen, setIsAddTimeBlockDialogOpen] = useState(false)
  const [isEditTimeBlockDialogOpen, setIsEditTimeBlockDialogOpen] = useState(false)
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(null)
  const [newTimeBlock, setNewTimeBlock] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    category: "work",
  })

  // UI state
  const [activeTab, setActiveTab] = useState("plan")
  const [dailyView, setDailyView] = useState<"tasks" | "schedule">("tasks")

  // Get current week dates
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd })
  const weekStartFormatted = format(currentWeekStart, "yyyy-MM-dd")
  const weekEndFormatted = format(weekEnd, "yyyy-MM-dd")
  const dateRangeText = `${format(currentWeekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`

  // Check if tables exist and create them if they don't
  const setupWeeklyPlannerTables = async () => {
    setSetupInProgress(true)
    try {
      // Execute the SQL migration
      const { error } = await supabase.rpc("exec_sql", {
        sql: `
          -- Create weekly plans table
          CREATE TABLE IF NOT EXISTS weekly_plans (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            week_start_date DATE NOT NULL,
            week_end_date DATE NOT NULL,
            theme TEXT,
            reflection TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, week_start_date)
          );

          -- Create big rocks table for weekly planning
          CREATE TABLE IF NOT EXISTS weekly_big_rocks (
            id UUID PRIMARY KEY,
            weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
            quadrant TEXT,
            priority INTEGER DEFAULT 1,
            completed BOOLEAN DEFAULT FALSE,
            task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Create daily plans table
          CREATE TABLE IF NOT EXISTS daily_plans (
            id UUID PRIMARY KEY,
            weekly_plan_id UUID NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            morning_review TEXT,
            evening_reflection TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, date)
          );

          -- Create time blocks table
          CREATE TABLE IF NOT EXISTS time_blocks (
            id UUID PRIMARY KEY,
            daily_plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            category TEXT,
            completed BOOLEAN DEFAULT FALSE,
            task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Add RLS policies
          ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
          ALTER TABLE weekly_big_rocks ENABLE ROW LEVEL SECURITY;
          ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
          ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

          -- Weekly plans policies
          CREATE POLICY "Users can view their own weekly plans"
          ON weekly_plans FOR SELECT
          USING (auth.uid() = user_id);

          CREATE POLICY "Users can create their own weekly plans"
          ON weekly_plans FOR INSERT
          WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update their own weekly plans"
          ON weekly_plans FOR UPDATE
          USING (auth.uid() = user_id);

          CREATE POLICY "Users can delete their own weekly plans"
          ON weekly_plans FOR DELETE
          USING (auth.uid() = user_id);

          -- Weekly big rocks policies
          CREATE POLICY "Users can view their own weekly big rocks"
          ON weekly_big_rocks FOR SELECT
          USING (auth.uid() = user_id);

          CREATE POLICY "Users can create their own weekly big rocks"
          ON weekly_big_rocks FOR INSERT
          WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update their own weekly big rocks"
          ON weekly_big_rocks FOR UPDATE
          USING (auth.uid() = user_id);

          CREATE POLICY "Users can delete their own weekly big rocks"
          ON weekly_big_rocks FOR DELETE
          USING (auth.uid() = user_id);

          -- Daily plans policies
          CREATE POLICY "Users can view their own daily plans"
          ON daily_plans FOR SELECT
          USING (auth.uid() = user_id);

          CREATE POLICY "Users can create their own daily plans"
          ON daily_plans FOR INSERT
          WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update their own daily plans"
          ON daily_plans FOR UPDATE
          USING (auth.uid() = user_id);

          CREATE POLICY "Users can delete their own daily plans"
          ON daily_plans FOR DELETE
          USING (auth.uid() = user_id);

          -- Time blocks policies
          CREATE POLICY "Users can view their own time blocks"
          ON time_blocks FOR SELECT
          USING (auth.uid() = user_id);

          CREATE POLICY "Users can create their own time blocks"
          ON time_blocks FOR INSERT
          WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update their own time blocks"
          ON time_blocks FOR UPDATE
          USING (auth.uid() = user_id);

          CREATE POLICY "Users can delete their own time blocks"
          ON time_blocks FOR DELETE
          USING (auth.uid() = user_id);
        `,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Weekly planner tables have been set up successfully.",
      })

      setDbError(null)
      return true
    } catch (error: any) {
      console.error("Error setting up weekly planner tables:", error)

      // If the exec_sql function doesn't exist, we'll need to inform the user
      if (error.message?.includes("function exec_sql() does not exist")) {
        setDbError(
          "Database setup requires admin privileges. Please contact your administrator to run the migration script.",
        )
        toast({
          title: "Setup Failed",
          description: "Database setup requires admin privileges. Please contact your administrator.",
          variant: "destructive",
        })
      } else {
        setDbError("Failed to set up weekly planner tables. Please try again later.")
        toast({
          title: "Setup Failed",
          description: "Failed to set up weekly planner tables. Please try again later.",
          variant: "destructive",
        })
      }

      return false
    } finally {
      setSetupInProgress(false)
    }
  }

  // Check if tables exist
  const checkTablesExist = async () => {
    try {
      // Try to query the weekly_plans table
      const { error } = await supabase.from("weekly_plans").select("count").limit(1)

      // If there's no error, the table exists
      if (!error) {
        return true
      }

      // If the error is about the relation not existing, the table doesn't exist
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return false
      }

      // For other errors, log them and assume the table might exist
      console.error("Error checking if tables exist:", error)
      return false
    } catch (error) {
      console.error("Error checking if tables exist:", error)
      return false
    }
  }

  // Fetch weekly plan and related data
  useEffect(() => {
    if (!user?.id) return

    const fetchWeeklyPlanData = async () => {
      setLoading(true)
      try {
        // First check if the tables exist
        const tablesExist = await checkTablesExist()

        if (!tablesExist) {
          setDbError("Weekly planner tables don't exist yet. Please set them up first.")
          setLoading(false)
          return
        }

        // Check if a plan exists for this week
        const { data: planData, error: planError } = await supabase
          .from("weekly_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("week_start_date", weekStartFormatted)
          .single()

        if (planError && planError.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error, which is expected if no plan exists
          console.error("Error fetching weekly plan:", planError)
          toast({
            title: "Error",
            description: "Failed to fetch weekly plan.",
            variant: "destructive",
          })
        }

        let currentPlan = planData

        // If no plan exists, create one
        if (!currentPlan) {
          const newPlan = {
            id: uuidv4(),
            user_id: user.id,
            week_start_date: weekStartFormatted,
            week_end_date: weekEndFormatted,
            theme: "",
            reflection: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { data: newPlanData, error: newPlanError } = await supabase
            .from("weekly_plans")
            .insert(newPlan)
            .select()
            .single()

          if (newPlanError) {
            console.error("Error creating weekly plan:", newPlanError)
            toast({
              title: "Error",
              description: "Failed to create weekly plan.",
              variant: "destructive",
            })
            setLoading(false)
            return
          }

          currentPlan = newPlanData
        }

        // Transform the plan data
        const transformedPlan: WeeklyPlan = {
          id: currentPlan.id,
          userId: currentPlan.user_id,
          weekStartDate: currentPlan.week_start_date,
          weekEndDate: currentPlan.week_end_date,
          theme: currentPlan.theme || "",
          reflection: currentPlan.reflection || "",
          createdAt: currentPlan.created_at,
          updatedAt: currentPlan.updated_at,
        }

        setWeeklyPlan(transformedPlan)
        setWeekTheme(transformedPlan.theme || "")
        setReflection(transformedPlan.reflection || "")

        // Fetch big rocks for this week
        const { data: rocksData, error: rocksError } = await supabase
          .from("weekly_big_rocks")
          .select("*")
          .eq("user_id", user.id)
          .eq("weekly_plan_id", transformedPlan.id)
          .order("priority", { ascending: true })

        if (rocksError) {
          console.error("Error fetching big rocks:", rocksError)
          toast({
            title: "Error",
            description: "Failed to fetch big rocks.",
            variant: "destructive",
          })
        }

        // Transform the rocks data
        const transformedRocks: BigRock[] = (rocksData || []).map((rock) => ({
          id: rock.id,
          weeklyPlanId: rock.weekly_plan_id,
          userId: rock.user_id,
          title: rock.title,
          description: rock.description || "",
          roleId: rock.role_id,
          quadrant: rock.quadrant,
          priority: rock.priority || 1,
          completed: rock.completed || false,
          taskId: rock.task_id,
          createdAt: rock.created_at,
          updatedAt: rock.updated_at,
        }))

        setBigRocks(transformedRocks)

        // Fetch daily plans for this week
        const { data: dailyPlansData, error: dailyPlansError } = await supabase
          .from("daily_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("weekly_plan_id", transformedPlan.id)
          .order("date", { ascending: true })

        if (dailyPlansError) {
          console.error("Error fetching daily plans:", dailyPlansError)
          toast({
            title: "Error",
            description: "Failed to fetch daily plans.",
            variant: "destructive",
          })
        }

        // Create daily plans for each day of the week if they don't exist
        const existingDailyPlans = dailyPlansData || []
        const newDailyPlans = []

        for (const day of weekDays) {
          const dateStr = format(day, "yyyy-MM-dd")
          const existingPlan = existingDailyPlans.find((plan) => plan.date === dateStr)

          if (!existingPlan) {
            const newDailyPlan = {
              id: uuidv4(),
              weekly_plan_id: transformedPlan.id,
              user_id: user.id,
              date: dateStr,
              morning_review: "",
              evening_reflection: "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }

            newDailyPlans.push(newDailyPlan)
          }
        }

        // Insert new daily plans if needed
        if (newDailyPlans.length > 0) {
          const { error: insertError } = await supabase.from("daily_plans").insert(newDailyPlans)

          if (insertError) {
            console.error("Error creating daily plans:", insertError)
            toast({
              title: "Error",
              description: "Failed to create daily plans.",
              variant: "destructive",
            })
          }
        }

        // Fetch all daily plans again if new ones were created
        let allDailyPlans = existingDailyPlans
        if (newDailyPlans.length > 0) {
          const { data: updatedDailyPlansData, error: updatedDailyPlansError } = await supabase
            .from("daily_plans")
            .select("*")
            .eq("user_id", user.id)
            .eq("weekly_plan_id", transformedPlan.id)
            .order("date", { ascending: true })

          if (updatedDailyPlansError) {
            console.error("Error fetching updated daily plans:", updatedDailyPlansError)
          } else {
            allDailyPlans = updatedDailyPlansData || []
          }
        }

        // Transform daily plans data
        const transformedDailyPlans: DailyPlan[] = allDailyPlans.map((plan) => ({
          id: plan.id,
          weeklyPlanId: plan.weekly_plan_id,
          userId: plan.user_id,
          date: plan.date,
          morningReview: plan.morning_review || "",
          eveningReflection: plan.evening_reflection || "",
          createdAt: plan.created_at,
          updatedAt: plan.updated_at,
        }))

        setDailyPlans(transformedDailyPlans)

        // Set today as the selected date if it's in the current week
        const today = new Date()
        const todayInWeek = weekDays.some((day) => isSameDay(day, today))
        if (todayInWeek) {
          setSelectedDate(today)
          const todayPlan = transformedDailyPlans.find((plan) => plan.date === format(today, "yyyy-MM-dd"))
          if (todayPlan) {
            setSelectedDailyPlan(todayPlan)
            setMorningReview(todayPlan.morningReview || "")
            setEveningReflection(todayPlan.eveningReflection || "")
          }
        } else {
          // Set the first day of the week as selected
          setSelectedDate(weekDays[0])
          const firstDayPlan = transformedDailyPlans.find((plan) => plan.date === format(weekDays[0], "yyyy-MM-dd"))
          if (firstDayPlan) {
            setSelectedDailyPlan(firstDayPlan)
            setMorningReview(firstDayPlan.morningReview || "")
            setEveningReflection(firstDayPlan.eveningReflection || "")
          }
        }

        setDbError(null)
      } catch (error) {
        console.error("Error in fetchWeeklyPlanData:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyPlanData()
  }, [user?.id, toast, weekStartFormatted, weekEndFormatted, weekDays])

  // Fetch time blocks when selected date changes
  useEffect(() => {
    if (!user?.id || !selectedDailyPlan) return

    const fetchTimeBlocks = async () => {
      try {
        const { data, error } = await supabase
          .from("time_blocks")
          .select("*")
          .eq("user_id", user.id)
          .eq("daily_plan_id", selectedDailyPlan.id)
          .order("start_time", { ascending: true })

        if (error) {
          console.error("Error fetching time blocks:", error)
          return
        }

        // Transform time blocks data
        const transformedTimeBlocks: TimeBlock[] = (data || []).map((block) => ({
          id: block.id,
          dailyPlanId: block.daily_plan_id,
          userId: block.user_id,
          title: block.title,
          description: block.description || "",
          startTime: block.start_time,
          endTime: block.end_time,
          category: block.category || "work",
          completed: block.completed || false,
          taskId: block.task_id,
          createdAt: block.created_at,
          updatedAt: block.updated_at,
        }))

        setTimeBlocks(transformedTimeBlocks)
      } catch (error) {
        console.error("Error in fetchTimeBlocks:", error)
      }
    }

    fetchTimeBlocks()
  }, [user?.id, selectedDailyPlan])

  // Handle week navigation
  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  // Handle day selection
  const handleDaySelect = (date: Date) => {
    setSelectedDate(date)
    const dateStr = format(date, "yyyy-MM-dd")
    const dailyPlan = dailyPlans.find((plan) => plan.date === dateStr)
    if (dailyPlan) {
      setSelectedDailyPlan(dailyPlan)
      setMorningReview(dailyPlan.morningReview || "")
      setEveningReflection(dailyPlan.eveningReflection || "")
    }
  }

  // Save weekly theme and reflection
  const saveWeeklyPlan = async () => {
    if (!user?.id || !weeklyPlan) return

    try {
      const { error } = await supabase
        .from("weekly_plans")
        .update({
          theme: weekTheme.trim(),
          reflection: reflection.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", weeklyPlan.id)

      if (error) {
        console.error("Error updating weekly plan:", error)
        toast({
          title: "Error",
          description: "Failed to update weekly plan.",
          variant: "destructive",
        })
        return
      }

      setWeeklyPlan((prev) =>
        prev
          ? {
              ...prev,
              theme: weekTheme.trim(),
              reflection: reflection.trim(),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )

      toast({
        title: "Weekly Plan Saved",
        description: "Your weekly plan has been updated.",
      })
    } catch (error) {
      console.error("Error in saveWeeklyPlan:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  // Save daily plan
  const saveDailyPlan = async () => {
    if (!user?.id || !selectedDailyPlan) return

    try {
      const { error } = await supabase
        .from("daily_plans")
        .update({
          morning_review: morningReview.trim(),
          evening_reflection: eveningReflection.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedDailyPlan.id)

      if (error) {
        console.error("Error updating daily plan:", error)
        toast({
          title: "Error",
          description: "Failed to update daily plan.",
          variant: "destructive",
        })
        return
      }

      setDailyPlans((prev) =>
        prev.map((plan) =>
          plan.id === selectedDailyPlan.id
            ? {
                ...plan,
                morningReview: morningReview.trim(),
                eveningReflection: eveningReflection.trim(),
                updatedAt: new Date().toISOString(),
              }
            : plan,
        ),
      )

      toast({
        title: "Daily Plan Saved",
        description: "Your daily plan has been updated.",
      })
    } catch (error) {
      console.error("Error in saveDailyPlan:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  // Add a new big rock
  const addBigRock = async () => {
    if (!user?.id || !weeklyPlan || !newRock.title.trim()) return

    try {
      const rockId = uuidv4()
      let taskId = null

      // First, create a task if the option is selected
      if (newRock.createTask) {
        taskId = uuidv4()
        const taskData = {
          id: taskId,
          title: newRock.title,
          description: newRock.description,
          quadrant: newRock.quadrant,
          completed: false,
          time_spent: 0,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: taskError } = await supabase.from("tasks").insert(taskData)

        if (taskError) {
          console.error("Error creating task for big rock:", taskError)
          // Continue with big rock creation even if task creation fails
        }
      }

      // Then create the big rock
      const newBigRock = {
        id: rockId,
        weekly_plan_id: weeklyPlan.id,
        user_id: user.id,
        title: newRock.title,
        description: newRock.description,
        role_id: newRock.roleId || null,
        quadrant: newRock.quadrant,
        priority: newRock.priority,
        completed: false,
        task_id: taskId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("weekly_big_rocks").insert(newBigRock)

      if (error) {
        console.error("Error inserting big rock:", error)
        throw error
      }

      // Add to local state
      const transformedRock: BigRock = {
        id: rockId,
        weeklyPlanId: weeklyPlan.id,
        userId: user.id,
        title: newRock.title,
        description: newRock.description,
        roleId: newRock.roleId || undefined,
        quadrant: newRock.quadrant,
        priority: newRock.priority,
        completed: false,
        taskId: taskId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setBigRocks((prev) => [...prev, transformedRock].sort((a, b) => a.priority - b.priority))

      // Reset form
      setNewRock({
        title: "",
        description: "",
        roleId: "",
        quadrant: "q2",
        priority: 1,
        createTask: true,
      })
      setIsAddRockDialogOpen(false)

      toast({
        title: "Success",
        description: "Big rock added successfully!",
      })
    } catch (error) {
      console.error("Error adding big rock:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add big rock. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle big rock completion
  const toggleRockCompletion = async (rockId: string) => {
    try {
      const rock = bigRocks.find((r) => r.id === rockId)
      if (!rock) return

      const newCompletedState = !rock.completed

      // Update in state first
      setBigRocks((prev) => prev.map((r) => (r.id === rockId ? { ...r, completed: newCompletedState } : r)))

      // Then update in database
      const { error } = await supabase
        .from("weekly_big_rocks")
        .update({ completed: newCompletedState, updated_at: new Date().toISOString() })
        .eq("id", rockId)

      if (error) {
        console.error("Error updating big rock:", error)
        toast({
          title: "Error",
          description: "Failed to update big rock.",
          variant: "destructive",
        })
        // Revert state change
        setBigRocks((prev) => prev.map((r) => (r.id === rockId ? { ...r, completed: rock.completed } : r)))
      }

      // If there's an associated task, update it too
      if (rock.taskId) {
        const { error: taskError } = await supabase
          .from("tasks")
          .update({ completed: newCompletedState, updated_at: new Date().toISOString() })
          .eq("id", rock.taskId)

        if (taskError) {
          console.error("Error updating task completion for big rock:", taskError)
        }
      }
    } catch (error) {
      console.error("Error in toggleRockCompletion:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  // Delete a big rock
  const deleteRock = async (rockId: string) => {
    try {
      const rock = bigRocks.find((r) => r.id === rockId)
      if (!rock) return

      // Update state first
      setBigRocks((prev) => prev.filter((r) => r.id !== rockId))

      // Then delete from database
      const { error } = await supabase.from("weekly_big_rocks").delete().eq("id", rockId)

      if (error) {
        console.error("Error deleting big rock:", error)
        toast({
          title: "Error",
          description: "Failed to delete big rock.",
          variant: "destructive",
        })
        // Refresh to get correct state
        fetchBigRocks()
        return
      }

      // If there's an associated task, delete it too
      if (rock.taskId) {
        const { error: taskError } = await supabase.from("tasks").delete().eq("id", rock.taskId)

        if (taskError) {
          console.error("Error deleting task for big rock:", taskError)
        }
      }

      toast({
        title: "Success",
        description: "Big rock deleted successfully!",
      })
    } catch (error) {
      console.error("Error in deleteRock:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  // Fetch big rocks
  const fetchBigRocks = async () => {
    if (!user?.id || !weeklyPlan) return

    try {
      const { data, error } = await supabase
        .from("weekly_big_rocks")
        .select("*")
        .eq("user_id", user.id)
        .eq("weekly_plan_id", weeklyPlan.id)
        .order("priority", { ascending: true })

      if (error) {
        console.error("Error fetching big rocks:", error)
        toast({
          title: "Error",
          description: "Failed to fetch big rocks.",
          variant: "destructive",
        })
        return
      }

      // Transform the rocks data
      const transformedRocks: BigRock[] = (data || []).map((rock) => ({
        id: rock.id,
        weeklyPlanId: rock.weekly_plan_id,
        userId: rock.user_id,
        title: rock.title,
        description: rock.description || "",
        roleId: rock.role_id,
        quadrant: rock.quadrant,
        priority: rock.priority || 1,
        completed: rock.completed || false,
        taskId: rock.task_id,
        createdAt: rock.created_at,
        updatedAt: rock.updated_at,
      }))

      setBigRocks(transformedRocks)
    } catch (error) {
      console.error("Error in fetchBigRocks:", error)
    }
  }

  // Add a new time block
  const addTimeBlock = async () => {
    if (!user?.id || !selectedDailyPlan || !newTimeBlock.title.trim()) return

    try {
      const timeBlockId = uuidv4()

      const newTimeBlockData = {
        id: timeBlockId,
        daily_plan_id: selectedDailyPlan.id,
        user_id: user.id,
        title: newTimeBlock.title,
        description: newTimeBlock.description,
        start_time: newTimeBlock.startTime,
        end_time: newTimeBlock.endTime,
        category: newTimeBlock.category,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("time_blocks").insert(newTimeBlockData)

      if (error) {
        console.error("Error inserting time block:", error)
        throw error
      }

      // Add to local state
      const transformedTimeBlock: TimeBlock = {
        id: timeBlockId,
        dailyPlanId: selectedDailyPlan.id,
        userId: user.id,
        title: newTimeBlock.title,
        description: newTimeBlock.description,
        startTime: newTimeBlock.startTime,
        endTime: newTimeBlock.endTime,
        category: newTimeBlock.category,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setTimeBlocks((prev) => [...prev, transformedTimeBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)))

      // Reset form
      setNewTimeBlock({
        title: "",
        description: "",
        startTime: "09:00",
        endTime: "10:00",
        category: "work",
      })
      setIsAddTimeBlockDialogOpen(false)

      toast({
        title: "Success",
        description: "Time block added successfully!",
      })
    } catch (error) {
      console.error("Error adding time block:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add time block. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle time block completion
  const toggleTimeBlockCompletion = async (blockId: string) => {
    try {
      const block = timeBlocks.find((b) => b.id === blockId)
      if (!block) return

      const newCompletedState = !block.completed

      // Update in state first
      setTimeBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, completed: newCompletedState } : b)))

      // Then update in database
      const { error } = await supabase
        .from("time_blocks")
        .update({ completed: newCompletedState, updated_at: new Date().toISOString() })
        .eq("id", blockId)

      if (error) {
        console.error("Error updating time block:", error)
        toast({
          title: "Error",
          description: "Failed to update time block.",
          variant: "destructive",
        })
        // Revert state change
        setTimeBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, completed: block.completed } : b)))
      }
    } catch (error) {
      console.error("Error in toggleTimeBlockCompletion:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  // Delete a time block
  const deleteTimeBlock = async (blockId: string) => {
    try {
      // Update state first
      setTimeBlocks((prev) => prev.filter((b) => b.id !== blockId))

      // Then delete from database
      const { error } = await supabase.from("time_blocks").delete().eq("id", blockId)

      if (error) {
        console.error("Error deleting time block:", error)
        toast({
          title: "Error",
          description: "Failed to delete time block.",
          variant: "destructive",
        })
        // Refresh time blocks
        if (selectedDailyPlan) {
          const { data, error } = await supabase
            .from("time_blocks")
            .select("*")
            .eq("user_id", user?.id)
            .eq("daily_plan_id", selectedDailyPlan.id)
            .order("start_time", { ascending: true })

          if (!error && data) {
            const transformedTimeBlocks: TimeBlock[] = (data || []).map((block) => ({
              id: block.id,
              dailyPlanId: block.daily_plan_id,
              userId: block.user_id,
              title: block.title,
              description: block.description || "",
              startTime: block.start_time,
              endTime: block.end_time,
              category: block.category || "work",
              completed: block.completed || false,
              taskId: block.task_id,
              createdAt: block.created_at,
              updatedAt: block.updated_at,
            }))
            setTimeBlocks(transformedTimeBlocks)
          }
        }
        return
      }

      toast({
        title: "Success",
        description: "Time block deleted successfully!",
      })
    } catch (error) {
      console.error("Error in deleteTimeBlock:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  // Calculate completion percentage
  const completionPercentage =
    bigRocks.length > 0 ? Math.round((bigRocks.filter((rock) => rock.completed).length / bigRocks.length) * 100) : 0

  // Group big rocks by role
  const rocksByRole = bigRocks.reduce(
    (acc, rock) => {
      const roleId = rock.roleId || "unassigned"
      if (!acc[roleId]) {
        acc[roleId] = []
      }
      acc[roleId].push(rock)
      return acc
    },
    {} as Record<string, BigRock[]>,
  )

  // Get role name by ID
  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.name : "Unassigned"
  }

  // Get role color by ID
  const getRoleColor = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.color : "#808080"
  }

  // Get quadrant name
  const getQuadrantName = (quadrant: string) => {
    switch (quadrant) {
      case "q1":
        return "Q1: Important & Urgent"
      case "q2":
        return "Q2: Important & Not Urgent"
      case "q3":
        return "Q3: Not Important & Urgent"
      case "q4":
        return "Q4: Not Important & Not Urgent"
      default:
        return "Unassigned"
    }
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work":
        return <BriefcaseIcon className="h-4 w-4" />
      case "personal":
        return <Heart className="h-4 w-4" />
      case "family":
        return <Home className="h-4 w-4" />
      case "community":
        return <Users className="h-4 w-4" />
      case "learning":
        return <BookOpen className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // If there's a database error, show a setup screen
  if (dbError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-primary" />
              Weekly Planner Setup Required
            </CardTitle>
            <CardDescription>
              The weekly planner feature requires additional database tables to be set up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-300">Database Setup Required</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">{dbError}</p>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">How to Set Up the Weekly Planner</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You have two options to set up the weekly planner feature:
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Option 1: Automatic Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the button below to attempt an automatic setup. This requires database permissions.
                  </p>
                  <Button onClick={setupWeeklyPlannerTables} disabled={setupInProgress} className="mt-2">
                    {setupInProgress ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting Up...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Set Up Weekly Planner Tables
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Option 2: Manual Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    If automatic setup fails, you'll need to run the migration script manually. Contact your
                    administrator or run the SQL migration file.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={() => window.location.reload()} className="w-full mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh After Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Weekly Planning
          </h2>
          <p className="text-muted-foreground">Week of {dateRangeText}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            {completionPercentage}% Complete
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="plan">Weekly Plan</TabsTrigger>
          <TabsTrigger value="daily">Daily Planning</TabsTrigger>
          <TabsTrigger value="reflect">Reflect & Review</TabsTrigger>
        </TabsList>

        {/* Weekly Plan Tab */}
        <TabsContent value="plan" className="space-y-6 pt-4">
          {/* Weekly Theme */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Weekly Theme
              </CardTitle>
              <CardDescription>Set a theme or focus for your week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  placeholder="e.g., 'Building Deep Work Habits' or 'Family First'"
                  value={weekTheme}
                  onChange={(e) => setWeekTheme(e.target.value)}
                />
                <Button size="sm" onClick={saveWeeklyPlan} className="mt-2">
                  <Save className="h-4 w-4 mr-2" />
                  Save Theme
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Big Rocks Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    Big Rocks
                  </CardTitle>
                  <CardDescription>Identify your most important priorities for the week</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsAddRockDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rock
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Big Rocks Explanation */}
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md flex items-start gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-medium">Stephen Covey's Big Rocks Principle:</p>
                  <p>
                    If you don't put the big rocks in first, the pebbles and sand will fill your time and the big rocks
                    won't fit. Identify your most important priorities (big rocks) and schedule them first.
                  </p>
                </div>
              </div>

              {/* Big Rocks List */}
              <div className="space-y-4">
                {bigRocks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No big rocks added yet</p>
                    <p className="text-sm">Add your most important priorities above</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weekly Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>

                    {/* Rocks by role */}
                    <div className="space-y-4">
                      {Object.entries(rocksByRole).map(([roleId, rocks]) => (
                        <div key={roleId} className="space-y-2">
                          <div
                            className="font-medium flex items-center text-sm py-1 px-2 rounded-md"
                            style={{
                              backgroundColor: roleId !== "unassigned" ? `${getRoleColor(roleId)}20` : "var(--muted)",
                            }}
                          >
                            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                            {roleId !== "unassigned" ? getRoleName(roleId) : "Unassigned"}
                          </div>
                          <div className="space-y-2 pl-2">
                            {rocks.map((rock) => (
                              <div
                                key={rock.id}
                                className={`p-3 border rounded-lg ${
                                  rock.completed ? "bg-muted/50 border-muted" : "bg-card"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={rock.completed}
                                    onCheckedChange={() => toggleRockCompletion(rock.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <h4
                                        className={`font-medium ${rock.completed ? "line-through text-muted-foreground" : ""}`}
                                      >
                                        {rock.title}
                                      </h4>
                                      <Badge variant="outline" className="text-xs">
                                        Priority {rock.priority}
                                      </Badge>
                                      {rock.quadrant && (
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${
                                            rock.quadrant === "q1"
                                              ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                              : rock.quadrant === "q2"
                                                ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                                : rock.quadrant === "q3"
                                                  ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                                  : "bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
                                          }`}
                                        >
                                          {rock.quadrant.toUpperCase()}
                                        </Badge>
                                      )}
                                    </div>
                                    {rock.description && (
                                      <p
                                        className={`text-sm ${
                                          rock.completed ? "text-muted-foreground/70" : "text-muted-foreground"
                                        }`}
                                      >
                                        {rock.description}
                                      </p>
                                    )}
                                    {rock.taskId && (
                                      <div className="flex items-center mt-1 text-xs text-primary">
                                        <ArrowRight className="h-3 w-3 mr-1" />
                                        Added to Quadrants
                                      </div>
                                    )}
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditingRock(rock)
                                          setIsEditRockDialogOpen(true)
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => deleteRock(rock.id)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Management Matrix Reminder */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                Time Management Matrix
              </CardTitle>
              <CardDescription>Remember to focus on Quadrant 2 activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3 bg-red-50 dark:bg-red-900/20">
                  <h4 className="font-medium text-red-800 dark:text-red-300">Q1: Urgent & Important</h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Crises, pressing problems, deadline-driven projects
                  </p>
                </div>
                <div className="border rounded-md p-3 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Q2: Not Urgent & Important</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Planning, prevention, relationship building, true recreation
                  </p>
                </div>
                <div className="border rounded-md p-3 bg-yellow-50 dark:bg-yellow-900/20">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Q3: Urgent & Not Important</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Interruptions, some calls, some meetings, popular activities
                  </p>
                </div>
                <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-medium text-gray-800 dark:text-gray-300">Q4: Not Urgent & Not Important</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    Trivia, busy work, time wasters, pleasant activities
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  <Target className="h-4 w-4 inline-block mr-1" />
                  Focus on Quadrant 2 activities to prevent crises and achieve work-life balance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Planning Tab */}
        <TabsContent value="daily" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Day Selection Sidebar */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Select Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weekDays.map((day) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                    const isCurrentDay = isToday(day)

                    return (
                      <Button
                        key={day.toString()}
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full justify-start ${isCurrentDay && !isSelected ? "border-primary/50" : ""}`}
                        onClick={() => handleDaySelect(day)}
                      >
                        <div className="flex items-center">
                          <div className={`w-9 text-center ${isSelected ? "text-primary-foreground" : ""}`}>
                            {format(day, "EEE")}
                          </div>
                          <div className={`ml-2 ${isSelected ? "text-primary-foreground" : ""}`}>
                            {format(day, "MMM d")}
                          </div>
                          {isCurrentDay && (
                            <Badge variant="outline" className="ml-auto">
                              Today
                            </Badge>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Daily Plan Content */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {selectedDate && format(selectedDate, "EEEE, MMMM d")}
                    </CardTitle>
                    <CardDescription>Plan your day to focus on what matters most</CardDescription>
                  </div>
                  <Tabs value={dailyView} onValueChange={(value) => setDailyView(value as "tasks" | "schedule")}>
                    <TabsList>
                      <TabsTrigger value="tasks">Tasks</TabsTrigger>
                      <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyView === "tasks" ? (
                  <div className="space-y-4">
                    {/* Morning Review */}
                    <div className="space-y-2">
                      <Label htmlFor="morning-review">Morning Review</Label>
                      <Textarea
                        id="morning-review"
                        placeholder="What are your top priorities for today? What would make today great?"
                        value={morningReview}
                        onChange={(e) => setMorningReview(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Big Rocks for Today */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Big Rocks for This Week</h3>
                      <div className="space-y-2">
                        {bigRocks.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No big rocks defined for this week yet.</p>
                        ) : (
                          bigRocks.map((rock) => (
                            <div
                              key={rock.id}
                              className={`p-3 border rounded-lg ${
                                rock.completed ? "bg-muted/50 border-muted" : "bg-card"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={rock.completed}
                                  onCheckedChange={() => toggleRockCompletion(rock.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <h4
                                    className={`font-medium ${rock.completed ? "line-through text-muted-foreground" : ""}`}
                                  >
                                    {rock.title}
                                  </h4>
                                  {rock.description && (
                                    <p className="text-sm text-muted-foreground">{rock.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Evening Reflection */}
                    <div className="space-y-2">
                      <Label htmlFor="evening-reflection">Evening Reflection</Label>
                      <Textarea
                        id="evening-reflection"
                        placeholder="What went well today? What could have gone better? What did you learn?"
                        value={eveningReflection}
                        onChange={(e) => setEveningReflection(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button onClick={saveDailyPlan}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Daily Plan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Time Blocks</h3>
                      <Button size="sm" onClick={() => setIsAddTimeBlockDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Block
                      </Button>
                    </div>

                    {timeBlocks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No time blocks scheduled</p>
                        <p className="text-sm">Schedule your day to focus on what matters most</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {timeBlocks.map((block) => (
                          <div
                            key={block.id}
                            className={`p-3 border rounded-lg ${
                              block.completed ? "bg-muted/50 border-muted" : "bg-card"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={block.completed}
                                onCheckedChange={() => toggleTimeBlockCompletion(block.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h4
                                    className={`font-medium ${block.completed ? "line-through text-muted-foreground" : ""}`}
                                  >
                                    {block.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      block.category === "work"
                                        ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                        : block.category === "personal"
                                          ? "bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                                          : block.category === "family"
                                            ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                            : block.category === "community"
                                              ? "bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                                              : "bg-gray-50 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
                                    }`}
                                  >
                                    <span className="flex items-center">
                                      {getCategoryIcon(block.category || "work")}
                                      <span className="ml-1 capitalize">{block.category}</span>
                                    </span>
                                  </Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <AlarmClock className="h-3 w-3 mr-1" />
                                  {formatTime(block.startTime)} - {formatTime(block.endTime)}
                                </div>
                                {block.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingTimeBlock(block)
                                      setIsEditTimeBlockDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteTimeBlock(block.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reflect & Review Tab */}
        <TabsContent value="reflect" className="space-y-6 pt-4">
          {/* Weekly Reflection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Rocket className="h-4 w-4 mr-2 text-primary" />
                Weekly Reflection
              </CardTitle>
              <CardDescription>Reflect on your achievements, challenges, and learnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="What went well this week? What challenges did you face? What did you learn? What will you do differently next week?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={6}
                />
                <Button onClick={saveWeeklyPlan}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Reflection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                Weekly Progress
              </CardTitle>
              <CardDescription>Track your progress on your big rocks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Completed Big Rocks</h4>
                  {bigRocks.filter((rock) => rock.completed).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No big rocks completed yet</p>
                  ) : (
                    <div className="space-y-2">
                      {bigRocks
                        .filter((rock) => rock.completed)
                        .map((rock) => (
                          <div key={rock.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>{rock.title}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Pending Big Rocks</h4>
                  {bigRocks.filter((rock) => !rock.completed).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending big rocks</p>
                  ) : (
                    <div className="space-y-2">
                      {bigRocks
                        .filter((rock) => !rock.completed)
                        .map((rock) => (
                          <div key={rock.id} className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span>{rock.title}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Covey Wisdom */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <LifeBuoy className="h-4 w-4 mr-2 text-primary" />
                Covey Wisdom
              </CardTitle>
              <CardDescription>Insights from Stephen Covey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <p className="italic text-blue-800 dark:text-blue-300">
                    "The key is not to prioritize what's on your schedule, but to schedule your priorities."
                  </p>
                  <p className="text-right text-sm text-blue-700 dark:text-blue-400 mt-2">— Stephen R. Covey</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md">
                  <p className="italic text-purple-800 dark:text-purple-300">
                    "Most of us spend too much time on what is urgent and not enough time on what is important."
                  </p>
                  <p className="text-right text-sm text-purple-700 dark:text-purple-400 mt-2">— Stephen R. Covey</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Big Rock Dialog */}
      <Dialog open={isAddRockDialogOpen} onOpenChange={setIsAddRockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Big Rock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newRock.title}
                onChange={(e) => setNewRock({ ...newRock, title: e.target.value })}
                placeholder="Enter big rock title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newRock.description}
                onChange={(e) => setNewRock({ ...newRock, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newRock.roleId} onValueChange={(value) => setNewRock({ ...newRock, roleId: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quadrant">Quadrant</Label>
              <Select value={newRock.quadrant} onValueChange={(value) => setNewRock({ ...newRock, quadrant: value })}>
                <SelectTrigger id="quadrant">
                  <SelectValue placeholder="Select quadrant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1">Q1: Important & Urgent</SelectItem>
                  <SelectItem value="q2">Q2: Important & Not Urgent</SelectItem>
                  <SelectItem value="q3">Q3: Not Important & Urgent</SelectItem>
                  <SelectItem value="q4">Q4: Not Important & Not Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newRock.priority.toString()}
                onValueChange={(value) => setNewRock({ ...newRock, priority: Number.parseInt(value) })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Highest</SelectItem>
                  <SelectItem value="2">2 - High</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - Low</SelectItem>
                  <SelectItem value="5">5 - Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="create-task">Add to Quadrants</Label>
                <input
                  type="checkbox"
                  id="create-task"
                  checked={newRock.createTask}
                  onChange={(e) => setNewRock({ ...newRock, createTask: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will create a task in your quadrants based on this big rock
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addBigRock}>Add Big Rock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Time Block Dialog */}
      <Dialog open={isAddTimeBlockDialogOpen} onOpenChange={setIsAddTimeBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Block</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="time-block-title">Title</Label>
              <Input
                id="time-block-title"
                value={newTimeBlock.title}
                onChange={(e) => setNewTimeBlock({ ...newTimeBlock, title: e.target.value })}
                placeholder="Enter time block title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-block-description">Description (Optional)</Label>
              <Textarea
                id="time-block-description"
                value={newTimeBlock.description}
                onChange={(e) => setNewTimeBlock({ ...newTimeBlock, description: e.target.value })}
                placeholder="Enter description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newTimeBlock.startTime}
                  onChange={(e) => setNewTimeBlock({ ...newTimeBlock, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newTimeBlock.endTime}
                  onChange={(e) => setNewTimeBlock({ ...newTimeBlock, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newTimeBlock.category}
                onValueChange={(value) => setNewTimeBlock({ ...newTimeBlock, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTimeBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTimeBlock}>Add Time Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

