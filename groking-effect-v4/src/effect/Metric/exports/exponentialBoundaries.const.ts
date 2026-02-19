/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: exponentialBoundaries
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.745Z
 *
 * Overview:
 * A helper method to create histogram bucket boundaries with exponentially increasing values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class BoundaryError extends Data.TaggedError("BoundaryError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create exponential boundaries for request size histogram
 * // Buckets: 0-1KB, 1-2KB, 2-4KB, 4-8KB, 8KB+
 * const sizeBoundaries = Metric.exponentialBoundaries({
 *   start: 1, // Starting at 1KB
 *   factor: 2, // Each boundary doubles the previous
 *   count: 5 // Creates 4 boundaries + infinity
 * })
 * console.log(sizeBoundaries) // [1, 2, 4, 8, Infinity]
 *
 * // Create a histogram for tracking request payload sizes
 * const requestSizeHistogram = Metric.histogram("request_size_kb", {
 *   description: "Request payload size distribution in KB",
 *   boundaries: sizeBoundaries
 * })
 *
 * // For very wide ranges, use larger factors
 * const latencyBoundaries = Metric.exponentialBoundaries({
 *   start: 0.1, // Start at 0.1ms
 *   factor: 10, // Each boundary is 10x larger
 *   count: 6 // Creates ranges: 0.1ms, 1ms, 10ms, 100ms, 1000ms+
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Record different request sizes
 *   yield* Metric.update(requestSizeHistogram, 1.5) // Goes in 1-2KB bucket
 *   yield* Metric.update(requestSizeHistogram, 3.2) // Goes in 2-4KB bucket
 *   yield* Metric.update(requestSizeHistogram, 12) // Goes in 8KB+ bucket
 *
 *   const value = yield* Metric.value(requestSizeHistogram)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "exponentialBoundaries";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A helper method to create histogram bucket boundaries with exponentially increasing values.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass BoundaryError extends Data.TaggedError("BoundaryError")<{\n  readonly operation: string\n}> {}\n\n// Create exponential boundaries for request size histogram\n// Buckets: 0-1KB, 1-2KB, 2-4KB, 4-8KB, 8KB+\nconst sizeBoundaries = Metric.exponentialBoundaries({\n  start: 1, // Starting at 1KB\n  factor: 2, // Each boundary doubles the previous\n  count: 5 // Creates 4 boundaries + infinity\n})\nconsole.log(sizeBoundaries) // [1, 2, 4, 8, Infinity]\n\n// Create a histogram for tracking request payload sizes\nconst requestSizeHistogram = Metric.histogram("request_size_kb", {\n  description: "Request payload size distribution in KB",\n  boundaries: sizeBoundaries\n})\n\n// For very wide ranges, use larger factors\nconst latencyBoundaries = Metric.exponentialBoundaries({\n  start: 0.1, // Start at 0.1ms\n  factor: 10, // Each boundary is 10x larger\n  count: 6 // Creates ranges: 0.1ms, 1ms, 10ms, 100ms, 1000ms+\n})\n\nconst program = Effect.gen(function*() {\n  // Record different request sizes\n  yield* Metric.update(requestSizeHistogram, 1.5) // Goes in 1-2KB bucket\n  yield* Metric.update(requestSizeHistogram, 3.2) // Goes in 2-4KB bucket\n  yield* Metric.update(requestSizeHistogram, 12) // Goes in 8KB+ bucket\n\n  const value = yield* Metric.value(requestSizeHistogram)\n  return value\n})';
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
