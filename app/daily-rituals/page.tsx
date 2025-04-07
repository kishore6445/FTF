import { Suspense } from "react"
import DailyRitualsWrapper from "@/components/daily-rituals-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { RitualDatabaseSetup } from "@/components/ritual-database-setup"

export default function DailyRitualsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Daily Rituals</h1>
      <RitualDatabaseSetup />
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <DailyRitualsWrapper />
      </Suspense>
    </div>
  )
}

