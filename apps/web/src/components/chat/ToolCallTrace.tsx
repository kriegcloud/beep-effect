"use client";

import type { ToolCallTrace as ToolCallTraceValue } from "@beep/web/state/chat.atoms";
import { Match, pipe } from "effect";
import * as A from "effect/Array";

interface ToolCallTraceProps {
  readonly traces: ReadonlyArray<ToolCallTraceValue>;
}

export function ToolCallTrace({ traces }: ToolCallTraceProps) {
  return Match.value(A.isReadonlyArrayNonEmpty(traces)).pipe(
    Match.when(false, () => null),
    Match.orElse(() => (
      <div className="mt-2 space-y-2 rounded-md border border-slate-700 bg-slate-950/80 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tool Calls</p>
        {pipe(
          traces,
          A.map((trace) => (
            <article key={trace.id} className="rounded-md border border-slate-800 bg-slate-900/80 p-2 text-[11px]">
              <p className="font-semibold text-sky-300">{trace.name}</p>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-slate-300">
                {JSON.stringify(trace.params, null, 2)}
              </pre>

              {Match.value(A.isReadonlyArrayNonEmpty(trace.results)).pipe(
                Match.when(false, () => <p className="mt-1 text-slate-500">Waiting for result...</p>),
                Match.orElse(() => (
                  <div className="mt-2 space-y-1">
                    {pipe(
                      trace.results,
                      A.map((result, index) => (
                        <div
                          key={`${trace.id}-${index}`}
                          className="rounded border border-slate-700 bg-slate-950/80 p-1"
                        >
                          <p className="text-[10px] text-slate-400">
                            {result.preliminary ? "Preliminary" : "Final"} · {result.isFailure ? "Failure" : "Success"}
                          </p>
                          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-slate-300">
                            {JSON.stringify(result.result, null, 2)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                ))
              )}
            </article>
          ))
        )}
      </div>
    ))
  );
}
