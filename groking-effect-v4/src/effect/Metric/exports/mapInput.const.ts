/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: mapInput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.961Z
 *
 * Overview:
 * Returns a new metric that is powered by this one, but which accepts updates of the specified new type, which must be transformable to the input type of this metric.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class MetricError extends Data.TaggedError("MetricError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a histogram that expects Duration values
 * const durationHistogram = Metric.histogram("request_duration_ms", {
 *   description: "Request duration in milliseconds",
 *   boundaries: Metric.linearBoundaries({ start: 0, width: 100, count: 10 })
 * })
 *
 * // Transform to accept number values representing milliseconds
 * const numberHistogram = Metric.mapInput(
 *   durationHistogram,
 *   (ms: number) => ms // Direct mapping from number to expected input
 * )
 *
 * const program = Effect.gen(function*() {
 *   // Now we can update with a plain number
 *   yield* Metric.update(numberHistogram, 250)
 *
 *   // Get metric value to see the recorded state
 *   const value = yield* Metric.value(numberHistogram)
 *   return value
 * })
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapInput";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary =
  "Returns a new metric that is powered by this one, but which accepts updates of the specified new type, which must be transformable to the input type of this metric.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass MetricError extends Data.TaggedError("MetricError")<{\n  readonly operation: string\n}> {}\n\n// Create a histogram that expects Duration values\nconst durationHistogram = Metric.histogram("request_duration_ms", {\n  description: "Request duration in milliseconds",\n  boundaries: Metric.linearBoundaries({ start: 0, width: 100, count: 10 })\n})\n\n// Transform to accept number values representing milliseconds\nconst numberHistogram = Metric.mapInput(\n  durationHistogram,\n  (ms: number) => ms // Direct mapping from number to expected input\n)\n\nconst program = Effect.gen(function*() {\n  // Now we can update with a plain number\n  yield* Metric.update(numberHistogram, 250)\n\n  // Get metric value to see the recorded state\n  const value = yield* Metric.value(numberHistogram)\n  return value\n})';
const moduleRecord = MetricModule as Record<string, unknown>;

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
  bunContext: BunContext,
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
