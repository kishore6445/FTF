export const dynamic = "force-dynamic";


import RitualStreakDashboard from "@/components/ritual-streak-dashboard"

export default function RitualStreaksPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Ritual Streaks</h1>
      <RitualStreakDashboard />
    </div>
  )
}

