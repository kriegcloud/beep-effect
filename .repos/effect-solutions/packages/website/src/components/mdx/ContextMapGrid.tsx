"use client"

import { cn } from "@/lib/cn"

interface ContextEntry {
  key: string
  service: string
  description?: string
}

interface ContextMapGridProps {
  entries: ContextEntry[]
  title?: string
  className?: string
}

export function ContextMapGrid({ entries, title = "Context", className }: ContextMapGridProps) {
  return (
    <div className={cn("not-prose my-8", className)}>
      <div className="mb-3 flex items-baseline gap-2">
        <div className="text-sm font-medium text-neutral-400">{title}</div>
        <div className="text-xs text-neutral-600 font-mono">Map&lt;string, any&gt;</div>
      </div>

      {entries.length === 0 ? (
        <div className="border border-dashed border-neutral-800 bg-neutral-950 rounded p-8 text-center">
          <div className="text-sm text-neutral-600">Empty context</div>
          <div className="mt-1 text-xs text-neutral-700 font-mono">Context.empty()</div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((entry, index) => (
            <div
              key={entry.key}
              className="group relative overflow-hidden border border-neutral-800 bg-neutral-950 rounded p-4 hover:border-neutral-700 hover:bg-neutral-900/50"
            >
              <div className="absolute top-2 right-2 text-xs font-mono text-neutral-700">{index}</div>

              <div className="mb-2">
                <div className="inline-block bg-blue-500/10 px-2 py-0.5 text-xs font-mono text-blue-400 rounded mb-1">
                  {entry.key}
                </div>
              </div>

              <div className="mb-2">
                <div className="inline-block bg-green-500/10 px-2 py-0.5 text-xs font-mono text-green-400 rounded">
                  {entry.service}
                </div>
              </div>

              {entry.description && <div className="text-xs text-neutral-500 leading-relaxed">{entry.description}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-neutral-600 font-mono">unsafeMap.size = {entries.length}</div>
    </div>
  )
}
