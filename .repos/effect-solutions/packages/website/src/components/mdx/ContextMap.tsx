"use client"

import { cn } from "@/lib/cn"

interface ContextEntry {
  key: string
  service: string
  description?: string
}

interface ContextMapProps {
  entries: ContextEntry[]
  title?: string
  className?: string
}

export function ContextMap({ entries, title = "Context", className }: ContextMapProps) {
  return (
    <div className={cn("not-prose my-8 border-y border-neutral-800 bg-neutral-950 p-6", className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="text-sm font-medium text-neutral-400">{title}</div>
        <div className="text-xs text-neutral-600">Map&lt;string, any&gt;</div>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.key}
            className="group border border-neutral-800 bg-neutral-900/50 p-4 hover:border-neutral-700 hover:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500/10 px-2 py-1 text-xs font-mono text-blue-400">{entry.key}</div>
                  <div className="text-neutral-600">→</div>
                  <div className="bg-green-500/10 px-2 py-1 text-xs font-mono text-green-400">{entry.service}</div>
                </div>

                {entry.description && <div className="text-sm text-neutral-500">{entry.description}</div>}
              </div>

              <div className="flex-shrink-0 bg-neutral-800 px-2 py-0.5 text-xs font-mono text-neutral-500">{index}</div>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="border border-dashed border-neutral-800 p-8 text-center">
          <div className="text-sm text-neutral-600">Empty context</div>
          <div className="mt-1 text-xs text-neutral-700">Context.empty()</div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-600">
        <div>
          {entries.length} {entries.length === 1 ? "service" : "services"}
        </div>
        <div className="font-mono">unsafeMap.size = {entries.length}</div>
      </div>
    </div>
  )
}
