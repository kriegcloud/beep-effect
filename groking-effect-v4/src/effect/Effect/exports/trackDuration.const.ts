/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: trackDuration
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.916Z
 *
 * Overview:
 * Updates the provided `Metric` with the `Duration` of time (in nanoseconds) that the wrapped `Effect` took to complete.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * const executionTimer = Metric.timer("execution_time")
 *
 * const program = Effect.sleep("100 millis").pipe(
 *   Effect.trackDuration(executionTimer)
 * )
 *
 * Effect.runPromise(program).then(() =>
 *   Effect.runPromise(Metric.value(executionTimer)).then(console.log)
 *   // Output: { count: 1, min: 100000000, max: 100000000, sum: 100000000 }
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "trackDuration";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Updates the provided `Metric` with the `Duration` of time (in nanoseconds) that the wrapped `Effect` took to complete.";
const sourceExample =
  'import { Effect, Metric } from "effect"\n\nconst executionTimer = Metric.timer("execution_time")\n\nconst program = Effect.sleep("100 millis").pipe(\n  Effect.trackDuration(executionTimer)\n)\n\nEffect.runPromise(program).then(() =>\n  Effect.runPromise(Metric.value(executionTimer)).then(console.log)\n  // Output: { count: 1, min: 100000000, max: 100000000, sum: 100000000 }\n)';
const moduleRecord = EffectModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
