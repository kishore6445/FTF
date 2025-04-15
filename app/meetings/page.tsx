"use client"
export const dynamic = "force-dynamic";

import { useState } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Clock,
  LayoutGrid,
  Users,
  Target,
  BookOpen,
  Inbox,
  Eye,
  Menu,
  LogOut,
} from "lucide-react"
import { useMeetings } from "@/hooks/use-meetings"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

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

interface MeetingFormData {
  id?: string
  title: string
  date: string
  time: string
  location: string
  type: "standup" | "client" | "review" | "other"
  description: string
  duration: number
  color: string
}

export default function MeetingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false)
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [formData, setFormData] = useState<MeetingFormData>({
    title: "",
    date: "",
    time: "",
    location: "",
    type: "other",
    description: "",
    duration: 30,
    color: "#3B82F6",
  })

  const { meetings, addMeeting, updateMeeting, deleteMeeting } = useMeetings()
  const { toast } = useToast()

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.date)
      return isSameDay(meetingDate, date)
    })
  }

  const selectedDateMeetings = getMeetingsForDate(selectedDate)

  const handleAddMeeting = async () => {
    if (!user) return

    try {
      // Validate required fields
      if (!formData.title || !formData.date || !formData.time) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Store metadata in the description field as JSON
      const descriptionData = {
        location: formData.location,
        type: formData.type,
        color: formData.color,
        notes: formData.description,
      }

      const newMeeting = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        description: JSON.stringify(descriptionData),
      }

      await addMeeting(newMeeting)

      toast({
        title: "Success",
        description: "Meeting added successfully",
      })

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
      toast({
        title: "Error",
        description: "Failed to add meeting. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditMeeting = async () => {
    if (!user || !formData.id) return

    try {
      // Store metadata in the description field as JSON
      const descriptionData = {
        location: formData.location,
        type: formData.type,
        color: formData.color,
        notes: formData.description,
      }

      const updatedMeeting = {
        id: formData.id,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        description: JSON.stringify(descriptionData),
      }

      await updateMeeting(updatedMeeting as Meeting)

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
      setIsEditMeetingOpen(false)
      setSelectedMeeting(null)
    } catch (error) {
      console.error("Error updating meeting:", error)
    }
  }

  const handleDeleteMeeting = async (meetingId: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting(meetingId)
      if (selectedMeeting?.id === meetingId) {
        setSelectedMeeting(null)
      }
    }
  }

  const openEditDialog = (meeting: Meeting) => {
    setFormData({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      location: meeting._location || "",
      type: meeting._type || "other",
      description: meeting.description || "",
      duration: meeting.duration,
      color: meeting._color || "#3B82F6",
    })
    setIsEditMeetingOpen(true)
  }

  // Set default color based on meeting type
  const updateColorForType = (type: MeetingFormData["type"]) => {
    if (type === "standup") {
      return "#3B82F6" // Blue
    } else if (type === "client") {
      return "#EF4444" // Red
    } else if (type === "review") {
      return "#10B981" // Green
    }
    return formData.color
  }

  const handleTypeChange = (type: MeetingFormData["type"]) => {
    const newColor = updateColorForType(type)
    setFormData({ ...formData, type, color: newColor })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col`}
      >
        <div className="flex flex-col flex-1 h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <h1 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${isSidebarOpen ? "" : "hidden"}`}>
              FirstThings
            </h1>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          <div className="flex-1 py-4">
            <Tabs orientation="vertical" className="h-full">
              <TabsList className="flex flex-col items-stretch bg-transparent space-y-1 h-auto border-none px-3">
                <TabsTrigger
                  value="mission-vision"
                  className="justify-start px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                  onClick={() => router.push("/dashboard?tab=mission-vision")}
                >
                  <Eye className="h-5 w-5 mr-3" />
                  {isSidebarOpen && "Mission & Vision"}
                </TabsTrigger>
                <TabsTrigger
                  value="quadrants"
                  className="justify-start px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                  onClick={() => router.push("/dashboard?tab=quadrants")}
                >
                  <LayoutGrid className="h-5 w-5 mr-3" />
                  {isSidebarOpen && "Quadrants"}
                </TabsTrigger>
                <TabsTrigger
                  value="roles"
                  className="justify-start px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                  onClick={() => router.push("/dashboard?tab=roles")}
                >
                  <Users className="h-5 w-5 mr-3" />
                  {isSidebarOpen && "Roles"}
                </TabsTrigger>
                <TabsTrigger
                  value="goals"
                  className="justify-start px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                  onClick={() => router.push("/dashboard?tab=goals")}
                >
                  <Target className="h-5 w-5 mr-3" />
                  {isSidebarOpen && "Goals"}
                </TabsTrigger>
                <TabsTrigger
                  value="principles"
                  className="justify-start px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                  onClick={() => router.push("/dashboard?tab=principles")}
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  {isSidebarOpen && "Principles"}
                </TabsTrigger>
                <TabsTrigger
                  value="time-tracking"
                  className="justify-start px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                  onClick={() => router.push("/dashboard?tab=time-tracking")}
                >
                  <Clock className="h-5 w-5 mr-3" />
                  {isSidebarOpen && "Time Tracking"}
                </TabsTrigger>
                <TabsTrigger
                  value="inbox"
                  className="justify-start px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                  onClick={() => router.push("/dashboard?tab=inbox")}
                >
                  <Inbox className="h-5 w-5 mr-3" />
                  {isSidebarOpen && "Inbox"}
                </TabsTrigger>
                <TabsTrigger
                  value="meetings"
                  className="justify-start px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <CalendarIcon className="h-5 w-5 mr-3" />
                  {isSidebarOpen && "Meetings"}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* User profile and sign out */}
          <div className="mt-auto border-t border-gray-100 dark:border-gray-700 p-4">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {user?.email?.[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.email}</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-0 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" className="w-full h-auto py-2" onClick={signOut} title="Sign Out">
                <LogOut className="h-5 w-5 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Meetings</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Meetings Calendar</h2>
                  <Button className="bg-black" onClick={() => setIsAddMeetingOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Meeting
                  </Button>
                </div>

                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" onClick={handlePreviousMonth}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <h3 className="text-lg font-medium">{format(currentDate, "MMMM yyyy")}</h3>
                  <Button variant="outline" onClick={handleNextMonth}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map(
                    (_, i) => (
                      <div key={`empty-${i}`} className="p-2" />
                    ),
                  )}
                  {days.map((day) => {
                    const dayMeetings = getMeetingsForDate(day)
                    const isSelected = isSameDay(day, selectedDate)
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`p-2 text-center relative hover:bg-gray-50 rounded-lg ${
                          isSelected ? "bg-gray-100" : ""
                        }`}
                      >
                        <span className="text-sm">{format(day, "d")}</span>
                        {dayMeetings.length > 0 && (
                          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Meetings List for Selected Date */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Meetings on {format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
                  <div className="space-y-2">
                    {selectedDateMeetings.length > 0 ? (
                      selectedDateMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className={`p-3 bg-white rounded-lg border hover:shadow transition-shadow cursor-pointer`}
                          style={{ borderLeftWidth: "4px", borderLeftColor: meeting._color || "#3B82F6" }}
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{meeting.title}</h4>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditDialog(meeting)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteMeeting(meeting.id)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{format(parseISO(`${meeting.date}T${meeting.time}`), "h:mm a")}</span>
                            {meeting._location && (
                              <>
                                <MapPin className="h-3.5 w-3.5 ml-3 mr-1" />
                                <span>{meeting._location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">No meetings scheduled for this day</div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Meeting Details */}
            <div className="md:col-span-1">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Meeting Details</h2>
                {selectedMeeting ? (
                  <div>
                    <h3 className="text-lg font-medium mb-4">{selectedMeeting.title}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{format(new Date(selectedMeeting.date), "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {format(parseISO(`${selectedMeeting.date}T${selectedMeeting.time}`), "h:mm a")} -
                          {format(
                            new Date(
                              parseISO(`${selectedMeeting.date}T${selectedMeeting.time}`).getTime() +
                                selectedMeeting.duration * 60000,
                            ),
                            "h:mm a",
                          )}
                        </span>
                      </div>
                      {selectedMeeting._location && (
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{selectedMeeting._location}</span>
                        </div>
                      )}
                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Description</h4>
                        <p className="text-gray-500">{selectedMeeting.description}</p>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(selectedMeeting)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteMeeting(selectedMeeting.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">Select a meeting to view details</div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Add Meeting Dialog */}
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
                onValueChange={(value) => handleTypeChange(value as MeetingFormData["type"])}
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

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditMeetingOpen} onOpenChange={setIsEditMeetingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Meeting Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter meeting title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Meeting Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleTypeChange(value as MeetingFormData["type"])}
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
                    <RadioGroupItem value={color.value} id={`edit-color-${color.value}`} className="sr-only" />
                    <Label
                      htmlFor={`edit-color-${color.value}`}
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
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter meeting location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Notes</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter meeting notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMeetingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMeeting}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

