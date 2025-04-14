
export const dynamic = "force-dynamic";

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getTasks, getRoles } from "@/lib/data"
import DashboardClient from "./client"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Error getting session:", sessionError)
  }

  if(session){
    console.error("Get session:", session)

  }

  // Fetch data
  const tasksPromise = getTasks()
  const rolesPromise = getRoles()

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient tasks={await tasksPromise} roles={await rolesPromise} session={session} />
      </Suspense>
    </div>
  )
}

async function DashboardSkeleton() {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

