"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  placeholder?: string
}

export function DatePicker({ date, onSelect, className, placeholder = "Select date" }: DatePickerProps) {
  const [selected, setSelected] = React.useState<Date | undefined>(date)
  const [open, setOpen] = React.useState(false)

  // Update selected when date prop changes
  React.useEffect(() => {
    setSelected(date)
  }, [date])

  const handleSelect = (newDate: Date | undefined) => {
    console.log("DatePicker handleSelect:", newDate)
    setSelected(newDate)
    setOpen(false)
    if (onSelect) {
      onSelect(newDate)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleSelect(undefined)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-2 w-full">
        <PopoverTrigger asChild className="flex-1">
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              className,
            )}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>

        {selected && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear} className="h-10 w-10">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 border-b flex justify-between items-center">
          <span className="text-sm font-medium">Select a date</span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelect(new Date())}
              className="h-7 px-2"
            >
              Today
            </Button>
            {selected && (
              <Button variant="ghost" size="sm" onClick={() => handleSelect(undefined)} className="h-7 px-2">
                Clear
              </Button>
            )}
          </div>
        </div>
        <Calendar mode="single" selected={selected} onSelect={handleSelect} initialFocus className="border-0" />
      </PopoverContent>
    </Popover>
  )
}

