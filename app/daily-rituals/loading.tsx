import { Skeleton } from "@/components/ui/skeleton"

export default function DailyRitualsLoading() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-10 w-64 mb-6" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}

