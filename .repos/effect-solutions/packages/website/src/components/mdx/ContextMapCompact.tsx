"use client"

import { cn } from "@/lib/cn"

interface ContextEntry {
  key: string
  service: string
  description?: string
}

interface ContextMapCompactProps {
  entries: ContextEntry[]
  title?: string
  className?: string
}

export function ContextMapCompact({ entries, title = "Context", className }: ContextMapCompactProps) {
  return (
    <div
      className={cn("not-prose my-8 overflow-hidden border border-neutral-800 bg-neutral-950 rounded-lg", className)}
    >
      <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-neutral-300">{title}</span>
          <span className="text-xs text-neutral-600 font-mono">
            {entries.length === 0 ? "empty" : `${entries.length} services`}
          </span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="p-6 text-center">
          <div className="text-xs text-neutral-600 font-mono">Context.empty()</div>
        </div>
      ) : (
        <div className="divide-y divide-neutral-800">
          {entries.map((entry) => (
            <div key={entry.key} className="px-4 py-2.5 hover:bg-neutral-900/50">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-mono text-blue-400">{entry.key}</span>
                <span className="text-neutral-700">→</span>
                <span className="text-xs font-mono text-green-400">{entry.service}</span>
              </div>
              {entry.description && <div className="text-xs text-neutral-600 pl-0">{entry.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
