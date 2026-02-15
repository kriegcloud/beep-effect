"use client";

import { GraphExplorer } from "@beep/knowledge-ui";
import { knowledgeGraphArbitrary } from "@beep/knowledge-ui/fixtures/knowledgeGraph";
import { Graph as GraphIcon } from "@phosphor-icons/react";
import * as FC from "effect/FastCheck";
import { useMemo, useState } from "react";

export default function KnowledgePage() {
  const [seed, setSeed] = useState(42);

  const sampleGraph = useMemo(() => {
    const sample = FC.sample(knowledgeGraphArbitrary, { seed, numRuns: 1 });
    return sample[0] ?? null;
  }, [seed]);

  const reseed = () => {
    setSeed(Math.floor(Math.random() * 0x7fffffff));
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2.5">
          <GraphIcon className="size-5 text-primary" weight="duotone" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Knowledge Graph</h1>
            <p className="text-sm text-muted-foreground">Explore entities and relationships</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reseed}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Reseed
        </button>
      </div>
      <div className="flex-1">
        {sampleGraph ? (
          <GraphExplorer graph={sampleGraph} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No graph data available.
          </div>
        )}
      </div>
    </div>
  );
}
