"use client"

import EnhancedWeeklyPlanner from "@/components/enhanced-weekly-planner"
import { useRoles } from "@/contexts/roles-context"

export default function CoveyWeeklyPlanner() {
  const { roles } = useRoles()

  return <EnhancedWeeklyPlanner roles={roles} />
}

