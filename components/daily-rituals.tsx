"use client"

interface Ritual {
  id: string
  title: string
  description: string | null
  user_id: string
  created_at: string
  category: string
  time_of_day: string
  days_of_week: string[]
}

interface RitualCompletion {
  id: string
  ritual_id: string
  completed_at: string
  user_id: string
  missed: boolean
}

export default function DailyRituals() {
  return (
    <div>
      <p>Daily Rituals Component</p>
    </div>
  )
}

