export const dynamic = "force-dynamic"
import GoalsManagement from "@/components/goals-management"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGoals } from "@/lib/data" // Assume we have this function to fetch data

export default async function GoalsPage() {
  const goals = await getGoals()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-light text-primary">Goals</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsManagement goals={goals} />
        </CardContent>
      </Card>
    </div>
  )
}

