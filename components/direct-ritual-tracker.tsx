"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Repeat, Award, Plus, Check, AlertCircle, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { format, isSameDay, isToday, addDays, subDays, parseISO } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Ritual {
  id: string
  title: string
  user_id: string
  created_at?: string
}

interface RitualCompletion {
  id: string
  ritual_id: string
  user_id: string
  date: string
}

export default function DirectRitualTracker() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [completions, setCompletions] = useState<RitualCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRitualTitle, setNewRitualTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingRitualId, setProcessingRitualId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Selected date formatted for display and comparison
  const selectedDateFormatted = format(selectedDate, "yyyy-MM-dd")
  const isSelectedDateToday = isToday(selectedDate)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, selectedDate])

  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    setErrorMessage(null)

    try {
      // Fetch rituals
      const { data: ritualsData, error: ritualsError } = await supabase
        .from("rituals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (ritualsError) {
        setErrorMessage(`Error fetching rituals: ${ritualsError.message}`)
        toast({
          title: "Error",
          description: "Failed to load rituals",
          variant: "destructive",
        })
        setRituals([])
      } else {
        setRituals(ritualsData || [])
      }

      // Fetch completions for the selected date
      const { data: completionsData, error: completionsError } = await supabase
        .from("ritual_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("date::date", selectedDateFormatted)

      if (completionsError) {
        setErrorMessage(`Error fetching completions: ${completionsError.message}`)
        toast({
          title: "Error",
          description: "Failed to load completions",
          variant: "destructive",
        })
        setCompletions([])
      } else {
        setCompletions(completionsData || [])
      }
    } catch (error: any) {
      setErrorMessage(`Unexpected error: ${error.message}`)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddRitual = async () => {
    if (!user) return

    if (!newRitualTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your ritual",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Generate a UUID for the new ritual
      const ritualId = uuidv4()
      const now = new Date().toISOString()

      // Insert the new ritual
      const { data, error } = await supabase
        .from("rituals")
        .insert({
          id: ritualId,
          title: newRitualTitle,
          user_id: user.id,
          created_at: now,
          updated_at: now,
        })
        .select()

      if (error) {
        setErrorMessage(`Error creating ritual: ${error.message}`)
        toast({
          title: "Error",
          description: "Failed to create ritual",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Ritual created successfully",
      })

      // Reset form and close dialog
      setNewRitualTitle("")
      setIsAddDialogOpen(false)

      // Refresh data
      fetchData()
    } catch (error: any) {
      setErrorMessage(`Unexpected error: ${error.message}`)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleCompletion = async (ritualId: string) => {
    if (!user) return

    setProcessingRitualId(ritualId)
    setErrorMessage(null)

    try {
      // Check if this ritual is already completed for the selected date
      const isCompleted = completions.some((c) => c.ritual_id === ritualId && isSameDay(parseISO(c.date), selectedDate))

      if (isCompleted) {
        // Find the completion to delete
        const completion = completions.find(
          (c) => c.ritual_id === ritualId && isSameDay(parseISO(c.date), selectedDate),
        )

        if (completion) {
          // Delete the completion
          const { error } = await supabase.from("ritual_completions").delete().eq("id", completion.id)

          if (error) {
            setErrorMessage(`Error deleting completion: ${error.message}`)
            toast({
              title: "Error",
              description: "Failed to update ritual status",
              variant: "destructive",
            })
            return
          }

          // Update local state
          setCompletions((prev) => prev.filter((c) => c.id !== completion.id))

          toast({
            title: "Success",
            description: "Ritual marked as incomplete",
          })
        }
      } else {
        // Insert a new completion using direct insert
        const completionId = uuidv4()
        const completionDate = new Date(selectedDate)
        // Set time to noon to avoid timezone issues
        completionDate.setHours(12, 0, 0, 0)
        const dateString = completionDate.toISOString()

        const { data, error } = await supabase
          .from("ritual_completions")
          .insert({
            id: completionId,
            ritual_id: ritualId,
            user_id: user.id,
            date: dateString,
          })
          .select()

        if (error) {
          setErrorMessage(`Error inserting completion: ${error.message}`)

          // Try a different approach - direct SQL execution
          const sql = `
          INSERT INTO ritual_completions (id, ritual_id, user_id, date)
          VALUES ('${completionId}', '${ritualId}', '${user.id}', '${dateString}')
          RETURNING id;
          `

          const { data: sqlData, error: sqlError } = await supabase.rpc("execute_sql", {
            sql_string: sql,
          })

          if (sqlError) {
            setErrorMessage(`Direct SQL failed: ${sqlError.message}`)
            toast({
              title: "Error",
              description: "Failed to update ritual status after multiple attempts",
              variant: "destructive",
            })
            return
          }

          // Add to local state
          const newCompletion = {
            id: completionId,
            ritual_id: ritualId,
            user_id: user.id,
            date: dateString,
          }

          setCompletions((prev) => [...prev, newCompletion])

          toast({
            title: "Success",
            description: "Ritual marked as complete (SQL method)",
          })
        } else {
          // Update local state with the returned data
          if (data && data.length > 0) {
            setCompletions((prev) => [...prev, data[0]])

            toast({
              title: "Success",
              description: "Ritual marked as complete",
            })
          }
        }
      }
    } catch (error: any) {
      setErrorMessage(`Unexpected error: ${error.message}`)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessingRitualId(null)
    }
  }

  const isRitualCompleted = (ritualId: string) => {
    return completions.some((c) => c.ritual_id === ritualId && isSameDay(parseISO(c.date), selectedDate))
  }

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1))
  }

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setCalendarOpen(false)
    }
  }

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Repeat className="h-5 w-5 mr-2 text-primary" />
            Direct Ritual Tracker
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
              Direct Ritual Tracker
            </CardTitle>
            <CardDescription>Simplified tracker with direct database access</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Ritual
          </Button>
        </CardHeader>
        <CardContent>
          {/* Date Selector */}
          <div className="flex items-center justify-between mb-6 bg-muted/20 p-2 rounded-md">
            <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {isSelectedDateToday ? (
                    <span className="font-medium text-primary">Today</span>
                  ) : (
                    format(selectedDate, "PPP")
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {rituals.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No rituals found. Start creating daily rituals!</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create Your First Ritual
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Award className="h-4 w-4 mr-2 text-primary" />
                {isSelectedDateToday ? "Today's Rituals" : `Rituals for ${format(selectedDate, "MMMM d, yyyy")}`}
              </h3>

              <div className="grid gap-2">
                {rituals.map((ritual) => {
                  const isCompleted = isRitualCompleted(ritual.id)
                  const isProcessing = processingRitualId === ritual.id

                  return (
                    <div
                      key={ritual.id}
                      className={`
                        p-4 rounded-lg border flex items-center justify-between
                        ${isCompleted ? "bg-green-50 border-green-200" : "bg-white"}
                        ${isProcessing ? "opacity-70" : ""}
                      `}
                    >
                      <div className="flex items-center">
                        <Checkbox
                          id={`ritual-${ritual.id}`}
                          checked={isCompleted}
                          disabled={isProcessing}
                          onCheckedChange={() => handleToggleCompletion(ritual.id)}
                          className={isCompleted ? "bg-green-500 text-white border-green-500" : ""}
                        />
                        <label
                          htmlFor={`ritual-${ritual.id}`}
                          className={`ml-2 font-medium ${isCompleted ? "text-green-700" : ""}`}
                        >
                          {ritual.title}
                        </label>
                      </div>

                      <Button
                        variant={isCompleted ? "outline" : "default"}
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleToggleCompletion(ritual.id)}
                        className={isProcessing ? "opacity-50" : ""}
                      >
                        {isProcessing ? (
                          <span className="animate-spin mr-1">⟳</span>
                        ) : isCompleted ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-500" />
                            Completed
                          </>
                        ) : (
                          "Mark Complete"
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center text-yellow-800 mb-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <h4 className="font-medium text-sm">Error Information</h4>
                  </div>
                  <pre className="text-xs text-yellow-700 whitespace-pre-wrap">{errorMessage}</pre>
                </div>
              )}

              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={fetchData}>
                  Refresh Data
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Ritual Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Ritual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newRitualTitle}
                onChange={(e) => setNewRitualTitle(e.target.value)}
                placeholder="Morning meditation"
              />
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

