'use client'

import { useAtomValue } from '@effect-atom/atom-react'
import { IssuesTableWrapper } from './_demo/issues-table-wrapper'
import { filtersAtom, cacheStatsAtom } from './_demo/atoms'
import { CodeBlock } from '@/components/code-block'

export default function Page() {
  const filters = useAtomValue(filtersAtom)
  const cacheStatsResult = useAtomValue(cacheStatsAtom)

  const cacheStats =
    cacheStatsResult._tag === 'Success' ? cacheStatsResult.value : null

  return (
    <div className="flex flex-col h-full p-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">
        Data Table Filter Demo
      </h1>
      <div className="grid grid-cols-[400px_1fr] gap-6">
        {/* Left side: Dev panel */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium mb-2">Current Filters</h2>
            <CodeBlock code={JSON.stringify(filters, null, 2)} lang="json" />
          </div>
          {cacheStats && (
            <div>
              <h2 className="text-sm font-medium mb-2">Cache Statistics</h2>
              <CodeBlock
                code={JSON.stringify(cacheStats, null, 2)}
                lang="json"
              />
            </div>
          )}
        </div>

        {/* Right side: Table - wrapper to contain the table within grid column */}
        <div className="min-w-0">
          <IssuesTableWrapper />
        </div>
      </div>
    </div>
  )
}
