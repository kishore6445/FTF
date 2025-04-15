export const dynamic = "force-dynamic";
import WeeklyPlanningGuide from "@/components/weekly-planning-guide"

export default function WeeklyPlanningGuidePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Weekly Planning Guide</h1>
      <WeeklyPlanningGuide />
    </div>
  )
}

