import PriorityLegend from "@/components/priority-legend"

export default function PriorityGuidePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Task Priority Guide</h1>

      <div className="max-w-md mx-auto">
        <PriorityLegend />

        <div className="mt-8 bg-muted p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Tips for Effective Prioritization</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Focus on A1 tasks first</strong> - These are your most critical tasks that need immediate
              attention
            </li>
            <li>
              <strong>Limit your A priorities</strong> - Not everything can be an A priority; be selective
            </li>
            <li>
              <strong>Review B tasks regularly</strong> - These are important but not urgent; schedule time for them
            </li>
            <li>
              <strong>Consider delegating C tasks</strong> - These are less important and might be candidates for
              delegation
            </li>
            <li>
              <strong>Combine with quadrants</strong> - Use priorities within each quadrant for maximum effectiveness
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

