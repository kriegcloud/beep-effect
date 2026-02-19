/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: linearBoundaries
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.961Z
 *
 * Overview:
 * A helper method to create histogram bucket boundaries with linearly increasing values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class BoundaryError extends Data.TaggedError("BoundaryError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create boundaries for response time histogram
 * // Buckets: 0-100ms, 100-200ms, 200-300ms, 300-400ms, 400ms+
 * const responseBoundaries = Metric.linearBoundaries({
 *   start: 0, // Starting point
 *   width: 100, // 100ms intervals
 *   count: 5 // Creates 4 boundaries + infinity
 * })
 * console.log(responseBoundaries) // [100, 200, 300, 400, Infinity]
 *
 * // Create a histogram using these boundaries
 * const responseTimeHistogram = Metric.histogram("api_response_time", {
 *   description: "API response time distribution",
 *   boundaries: responseBoundaries
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Record some response times
 *   yield* Metric.update(responseTimeHistogram, 85) // Goes in 0-100ms bucket
 *   yield* Metric.update(responseTimeHistogram, 250) // Goes in 200-300ms bucket
 *   yield* Metric.update(responseTimeHistogram, 450) // Goes in 400ms+ bucket
 *
 *   const value = yield* Metric.value(responseTimeHistogram)
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
const exportName = "linearBoundaries";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A helper method to create histogram bucket boundaries with linearly increasing values.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass BoundaryError extends Data.TaggedError("BoundaryError")<{\n  readonly operation: string\n}> {}\n\n// Create boundaries for response time histogram\n// Buckets: 0-100ms, 100-200ms, 200-300ms, 300-400ms, 400ms+\nconst responseBoundaries = Metric.linearBoundaries({\n  start: 0, // Starting point\n  width: 100, // 100ms intervals\n  count: 5 // Creates 4 boundaries + infinity\n})\nconsole.log(responseBoundaries) // [100, 200, 300, 400, Infinity]\n\n// Create a histogram using these boundaries\nconst responseTimeHistogram = Metric.histogram("api_response_time", {\n  description: "API response time distribution",\n  boundaries: responseBoundaries\n})\n\nconst program = Effect.gen(function*() {\n  // Record some response times\n  yield* Metric.update(responseTimeHistogram, 85) // Goes in 0-100ms bucket\n  yield* Metric.update(responseTimeHistogram, 250) // Goes in 200-300ms bucket\n  yield* Metric.update(responseTimeHistogram, 450) // Goes in 400ms+ bucket\n\n  const value = yield* Metric.value(responseTimeHistogram)\n  return value\n})';
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
