import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function BigRocksLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>

      {Array(3)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
    </div>
  )
}

