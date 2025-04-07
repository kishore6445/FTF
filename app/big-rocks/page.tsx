import { Suspense } from "react"
import BigRocks from "@/components/big-rocks"
import { getBigRocks, getRoles } from "@/lib/data"
import { Loader2 } from "lucide-react"

export default async function BigRocksPage() {
  // Fetch data
  const bigRocksPromise = getBigRocks()
  const rolesPromise = getRoles()

  return (
    <div className="container mx-auto py-6">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <BigRocksContent bigRocksPromise={bigRocksPromise} rolesPromise={rolesPromise} />
      </Suspense>
    </div>
  )
}

async function BigRocksContent({
  bigRocksPromise,
  rolesPromise,
}: {
  bigRocksPromise: Promise<any>
  rolesPromise: Promise<any>
}) {
  const [bigRocks, roles] = await Promise.all([bigRocksPromise, rolesPromise])

  return <BigRocks initialBigRocks={bigRocks} roles={roles} />
}

