"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import FranklinCoveyPlanner from "@/components/franklin-covey-planner"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function FranklinPlannerPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // If not loading and no user, redirect to login
    if (!loading && !user && isClient) {
      router.push("/login?redirectTo=/franklin-planner")
    }
  }, [user, loading, router, isClient])

  // Show loading state while checking authentication
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading planner...</span>
      </div>
    )
  }

  // If authenticated, show the planner
  if (user) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Franklin Covey Planner</h1>
        <FranklinCoveyPlanner />
      </div>
    )
  }

  // This should not be visible, but as a fallback
  return null
}

