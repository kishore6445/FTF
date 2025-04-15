export const dynamic = "force-dynamic";

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import SimplifiedBigRocksWrapper from "@/components/simplified-big-rocks-wrapper"

export default function SimplifiedBigRocksPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <SimplifiedBigRocksWrapper />
      </Suspense>
    </div>
  )
}

