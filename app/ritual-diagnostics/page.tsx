export const dynamic = "force-dynamic";

import RitualDiagnosticTool from "@/components/ritual-diagnostic-tool"

export default function RitualDiagnosticsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Ritual Diagnostics</h1>
      <RitualDiagnosticTool />
    </div>
  )
}

