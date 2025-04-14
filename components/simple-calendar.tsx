"use client"
export const dynamic = "force-dynamic";

import * as React from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight, CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SimpleCalendarProps {
  selectedDate?: Date
  onDateChange: (date: Date | undefined) => void
  className?: string
}

// IST offset is UTC+5:30 (330 minutes)
const IST_OFFSET = 330

// Helper function to convert to IST
function toIST(date: Date): Date {
  const localTime = date.getTime()
  const localOffset = date.getTimezoneOffset() * 60000 // Convert minutes to milliseconds
  const utc = localTime + localOffset
  const istTime = utc + IST_OFFSET * 60000
  return new Date(istTime)
}

// Helper function to format date in IST
function formatIST(date: Date, formatStr: string): string {
  const istDate = toIST(date)
  return format(istDate, formatStr)
}

export function SimpleCalendar({ selectedDate, onDateChange, className }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate ? toIST(selectedDate) : toIST(new Date()))
  const [isOpen, setIsOpen] = React.useState(false)
  const calendarRef = React.useRef<HTMLDivElement>(null)

  // Handle outside clicks to close the calendar
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Update current month when selected date changes
  React.useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(toIST(selectedDate))
    }
  }, [selectedDate])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleDateSelect = (date: Date) => {
    onDateChange(date)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange(undefined)
  }

  const handleToday = () => {
    const today = toIST(new Date())
    onDateChange(today)
    setCurrentMonth(today)
    setIsOpen(false)
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Get day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? formatIST(selectedDate, "PPP") : "Select date (IST)"}
        </Button>

        {selectedDate && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 w-[300px]"
        >
          <div className="p-2 border-b flex justify-between items-center">
            <span className="text-sm font-medium">Select a date (IST)</span>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" onClick={handleToday} className="h-7 px-2 text-xs">
                Today
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-3">
            {/* Month navigation */}
            <div className="flex justify-between items-center mb-4">
              <Button type="button" variant="ghost" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-sm font-medium">{formatIST(currentMonth, "MMMM yyyy")}</h2>
              <Button type="button" variant="ghost" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  {day.charAt(0)}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days of the week before the first day of the month */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="h-8" />
              ))}

              {/* Days of the month */}
              {days.map((day) => {
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                const isCurrent = isToday(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)

                return (
                  <Button
                    key={day.toString()}
                    type="button"
                    variant={isSelected ? "default" : "ghost"}
                    className={cn(
                      "h-8 w-8 p-0 text-sm",
                      !isCurrentMonth && "text-gray-400 dark:text-gray-600",
                      isCurrent && !isSelected && "border border-primary text-primary",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    )}
                    onClick={() => handleDateSelect(day)}
                  >
                    {format(day, "d")}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

