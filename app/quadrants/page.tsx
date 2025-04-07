import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import QuadrantGridWrapper from "@/components/quadrant-grid-wrapper"
import PriorityLegend from "@/components/priority-legend"
import DndWrapper from "@/components/dnd-wrapper"
import { TasksProvider } from "@/contexts/tasks-context"
import { RolesProvider } from "@/contexts/roles-context"

export default function QuadrantsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Task Quadrants</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <TasksProvider>
              <RolesProvider>
                <DndWrapper>
                  <QuadrantGridWrapper />
                </DndWrapper>
              </RolesProvider>
            </TasksProvider>
          </Suspense>
        </div>

        <div className="space-y-6">
          <PriorityLegend />

          {/* Other sidebar components can go here */}
        </div>
      </div>
    </div>
  )
}

