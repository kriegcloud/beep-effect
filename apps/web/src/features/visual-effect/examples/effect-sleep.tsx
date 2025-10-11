"use client";

import { Effect } from "effect";
import { useMemo } from "react";
import { EffectExample } from "@/features/visual-effect/components/display";
import type { ExampleComponentProps } from "@/features/visual-effect/lib/example-types";
import { notify, visualEffect } from "@/features/visual-effect/VisualEffect";

export function EffectSleepExample({ exampleId, index, metadata }: ExampleComponentProps) {
  const sleepTask = useMemo(
    () =>
      visualEffect(
        "sleep",
        Effect.gen(function* () {
          yield* Effect.sleep("1 second");

          // Show sleep notification during the main sleep
          yield* notify("😴", {
            duration: 2000,
          });

          yield* Effect.sleep("2 seconds");

          return "Refreshed!";
        })
      ),
    []
  );

  // Simplified code snippet without visualization implementation details
  const codeSnippet = `const sleepEffect = Effect.gen(function* () {
  yield* Effect.sleep("3 seconds");
  return "Refreshed!";
});`;

  const taskHighlightMap = useMemo(
    () => ({
      sleep: {
        text: 'Effect.sleep("3 seconds")',
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
      effects={useMemo(() => [sleepTask], [sleepTask])}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  );
}

export default EffectSleepExample;
