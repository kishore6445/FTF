
export const dynamic = "force-dynamic";

import SimpleRitualTracker from "@/components/simple-ritual-tracker"

export default function SimpleRitualsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Simple Ritual Tracker</h1>
      <SimpleRitualTracker />
    </div>
  )
}

