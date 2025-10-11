"use client";

import { Effect } from "effect";
import { useMemo } from "react";
import { EffectExample } from "@/features/visual-effect/components/display";
import { NumberResult } from "@/features/visual-effect/components/renderers";
import type { ExampleComponentProps } from "@/features/visual-effect/lib/example-types";
import { visualEffect } from "@/features/visual-effect/VisualEffect";

export function EffectSyncExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const syncTask = useMemo(
    () => visualEffect("random", Effect.sync(() => Math.random()).pipe(Effect.map((value) => new NumberResult(value)))),
    []
  );

  const codeSnippet = `const random = Effect.sync(() => Math.random())`;

  const taskHighlightMap = useMemo(
    () => ({
      random: {
        text: "Effect.sync(() => Math.random())",
      },
    }),
    []
  );

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={useMemo(() => [syncTask], [syncTask])}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  );
}

export default EffectSyncExample;
