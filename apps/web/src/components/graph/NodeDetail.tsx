"use client";

import type { GraphFact, GraphNode } from "@beep/web/lib/effect/mappers";
import { Match, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

interface NodeDetailProps {
  readonly node: O.Option<GraphNode>;
  readonly facts: ReadonlyArray<GraphFact>;
  readonly onClose: () => void;
}

export function NodeDetail({ node, facts, onClose }: NodeDetailProps) {
  return pipe(
    node,
    O.match({
      onNone: () => null,
      onSome: (selectedNode) => (
        <aside className="absolute left-0 top-0 z-20 h-full w-[340px] border-r border-slate-800 bg-slate-950/95 backdrop-blur-sm">
          <div className="flex h-full flex-col">
            <header className="border-b border-slate-800 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Node Detail</p>
                  <h2 className="text-lg font-semibold text-slate-100">{selectedNode.name}</h2>
                  <p className="text-xs font-medium text-amber-400">{selectedNode.type}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-200">Summary</h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {Match.value(Str.isNonEmpty(Str.trim(selectedNode.summary))).pipe(
                    Match.when(true, () => selectedNode.summary),
                    Match.orElse(() => "No summary available for this node yet.")
                  )}
                </p>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">Related Facts</h3>
                  <span className="text-xs text-slate-400">{facts.length}</span>
                </div>

                {Match.value(A.isReadonlyArrayNonEmpty(facts)).pipe(
                  Match.when(false, () => (
                    <p className="rounded-md border border-dashed border-slate-700 p-3 text-xs text-slate-400">
                      Facts will appear here after expanding this node.
                    </p>
                  )),
                  Match.orElse(() => (
                    <div className="space-y-2">
                      {pipe(
                        facts,
                        A.map((fact) => (
                          <article
                            key={fact.id}
                            className="rounded-md border border-slate-800 bg-slate-900/70 p-3 text-xs"
                          >
                            <p className="font-semibold uppercase tracking-wide text-slate-300">{fact.relationship}</p>
                            <p className="mt-1 text-slate-200">{fact.fact}</p>
                          </article>
                        ))
                      )}
                    </div>
                  ))
                )}
              </section>
            </div>
          </div>
        </aside>
      ),
    })
  );
}
