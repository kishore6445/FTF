import { TimeTrackingDashboard } from "@/components/time-tracking-dashboard"

export default function TimeTrackingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Time Tracking</h1>
      </div>

      <TimeTrackingDashboard />
    </div>
  )
}

