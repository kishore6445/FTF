"use client"
export const dynamic = "force-dynamic";

import type React from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calendar, Target, Clock, RotateCcw, ListTodo } from "lucide-react"

export default function QuickAccess() {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Access</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <QuickAccessCard
          title="Franklin Planner"
          icon={<BookOpen className="h-5 w-5 text-indigo-600" />}
          onClick={() => router.push("/franklin-planner")}
        />

        <QuickAccessCard
          title="Daily Rituals"
          icon={<RotateCcw className="h-5 w-5 text-blue-600" />}
          onClick={() => router.push("/daily-rituals")}
          highlight={true}
        />

        <QuickAccessCard
          title="Weekly Plan"
          icon={<Calendar className="h-5 w-5 text-green-600" />}
          onClick={() => router.push("/planner")}
        />

        <QuickAccessCard
          title="Big Rocks"
          icon={<Target className="h-5 w-5 text-amber-600" />}
          onClick={() => router.push("/big-rocks")}
        />

        <QuickAccessCard
          title="Task Inbox"
          icon={<ListTodo className="h-5 w-5 text-gray-600" />}
          onClick={() => router.push("/task-inbox")}
        />

        <QuickAccessCard
          title="Pomodoro"
          icon={<Clock className="h-5 w-5 text-red-600" />}
          onClick={() => router.push("/pomodoro-timer")}
        />
      </div>
    </div>
  )
}

function QuickAccessCard({
  title,
  icon,
  onClick,
  highlight = false,
}: {
  title: string
  icon: React.ReactNode
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <Card
      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
        highlight ? "border-blue-200 bg-blue-50 hover:bg-blue-100" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        {icon}
        <span className="mt-2 text-sm font-medium">{title}</span>
      </CardContent>
    </Card>
  )
}

