"use client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { RecurrencePattern } from "@/lib/types"

const weekdays = [
  { id: "MO", label: "Monday" },
  { id: "TU", label: "Tuesday" },
  { id: "WE", label: "Wednesday" },
  { id: "TH", label: "Thursday" },
  { id: "FR", label: "Friday" },
  { id: "SA", label: "Saturday" },
  { id: "SU", label: "Sunday" },
]

const formSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.number().min(1).max(99),
  daysOfWeek: z.array(z.string()).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  monthOfYear: z.number().min(1).max(12).optional(),
  startDate: z.date(),
  hasEndDate: z.boolean().default(false),
  endDate: z.date().optional(),
  hasCount: z.boolean().default(false),
  count: z.number().min(1).max(999).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RecurrenceFormProps {
  recurrencePattern?: RecurrencePattern
  onSubmit: (data: RecurrencePattern) => void
  onCancel: () => void
}

export default function RecurrenceForm({ recurrencePattern, onSubmit, onCancel }: RecurrenceFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frequency: recurrencePattern?.frequency || "weekly",
      interval: recurrencePattern?.interval || 1,
      daysOfWeek: recurrencePattern?.daysOfWeek || ["MO"],
      dayOfMonth: recurrencePattern?.dayOfMonth || 1,
      monthOfYear: recurrencePattern?.monthOfYear || 1,
      startDate: recurrencePattern?.startDate ? new Date(recurrencePattern.startDate) : new Date(),
      hasEndDate: !!recurrencePattern?.endDate,
      endDate: recurrencePattern?.endDate ? new Date(recurrencePattern.endDate) : undefined,
      hasCount: !!recurrencePattern?.count,
      count: recurrencePattern?.count || 10,
    },
  })

  const frequency = form.watch("frequency")
  const hasEndDate = form.watch("hasEndDate")
  const hasCount = form.watch("hasCount")

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    const recurrenceData: RecurrencePattern = {
      frequency: values.frequency,
      interval: values.interval,
      startDate: values.startDate.toISOString().split("T")[0],
      daysOfWeek: values.frequency === "weekly" ? values.daysOfWeek : undefined,
      dayOfMonth: values.frequency === "monthly" || values.frequency === "yearly" ? values.dayOfMonth : undefined,
      monthOfYear: values.frequency === "yearly" ? values.monthOfYear : undefined,
      endDate: values.hasEndDate && values.endDate ? values.endDate.toISOString().split("T")[0] : undefined,
      count: values.hasCount && values.count ? values.count : undefined,
    }

    onSubmit(recurrenceData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="daily" />
                      </FormControl>
                      <FormLabel className="font-normal">Daily</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="weekly" />
                      </FormControl>
                      <FormLabel className="font-normal">Weekly</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="monthly" />
                      </FormControl>
                      <FormLabel className="font-normal">Monthly</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yearly" />
                      </FormControl>
                      <FormLabel className="font-normal">Yearly</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat every</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      className="w-20"
                    />
                  </FormControl>
                  <span>
                    {frequency === "daily" && (field.value === 1 ? "day" : "days")}
                    {frequency === "weekly" && (field.value === 1 ? "week" : "weeks")}
                    {frequency === "monthly" && (field.value === 1 ? "month" : "months")}
                    {frequency === "yearly" && (field.value === 1 ? "year" : "years")}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {frequency === "weekly" && (
            <FormField
              control={form.control}
              name="daysOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat on</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map((day) => (
                      <FormItem key={day.id} className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(day.id)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || []
                              if (checked) {
                                field.onChange([...currentValue, day.id])
                              } else {
                                field.onChange(currentValue.filter((value) => value !== day.id))
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{day.label.substring(0, 2)}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {frequency === "monthly" && (
            <FormField
              control={form.control}
              name="dayOfMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of month</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number.parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {frequency === "yearly" && (
            <>
              <FormField
                control={form.control}
                name="monthOfYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayOfMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="hasEndDate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel>End date</FormLabel>
                    <FormDescription>Set an end date for this recurring task</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {hasEndDate && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="hasCount"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel>Occurrence limit</FormLabel>
                    <FormDescription>Limit the number of occurrences</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {hasCount && (
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of occurrences</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  )
}

