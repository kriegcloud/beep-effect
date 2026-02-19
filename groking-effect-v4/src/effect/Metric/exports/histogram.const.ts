/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: histogram
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.745Z
 *
 * Overview:
 * Represents a `Histogram` metric that records observations into buckets.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class HistogramError extends Data.TaggedError("HistogramError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a histogram for API response times
 *   const responseTimeHistogram = Metric.histogram("api_response_time", {
 *     description: "Distribution of API response times in milliseconds",
 *     boundaries: Metric.linearBoundaries({ start: 0, width: 50, count: 10 })
 *     // Creates buckets: 0-50ms, 50-100ms, 100-150ms, ..., 400-450ms, 450ms+
 *   })
 *
 *   // Create a histogram for request payload sizes
 *   const payloadSizeHistogram = Metric.histogram("payload_size", {
 *     description: "Distribution of request payload sizes in KB",
 *     boundaries: Metric.exponentialBoundaries({ start: 1, factor: 2, count: 8 }),
 *     // Creates exponential buckets: 1KB, 2KB, 4KB, 8KB, 16KB, 32KB, 64KB, 128KB+
 *     attributes: { service: "api-gateway" }
 *   })
 *
 *   // Create a histogram with custom boundaries
 *   const customHistogram = Metric.histogram("custom_metric", {
 *     description: "Custom distribution metric",
 *     boundaries: [0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 100]
 *   })
 *
 *   // Record various response times
 *   yield* Metric.update(responseTimeHistogram, 25) // Goes in 0-50ms bucket
 *   yield* Metric.update(responseTimeHistogram, 75) // Goes in 50-100ms bucket
 *   yield* Metric.update(responseTimeHistogram, 125) // Goes in 100-150ms bucket
 *   yield* Metric.update(responseTimeHistogram, 200) // Goes in 150-200ms bucket
 *   yield* Metric.update(responseTimeHistogram, 75) // Another 50-100ms
 *
 *   // Record payload sizes
 *   yield* Metric.update(payloadSizeHistogram, 3) // Goes in 2-4KB bucket
 *   yield* Metric.update(payloadSizeHistogram, 15) // Goes in 8-16KB bucket
 *   yield* Metric.update(payloadSizeHistogram, 0.5) // Goes in 0-1KB bucket
 *
 *   // Get histogram state with distribution data
 *   const responseTimeState = yield* Metric.value(responseTimeHistogram)
 *   const payloadSizeState = yield* Metric.value(payloadSizeHistogram)
 *
 *   // responseTimeState will contain:
 *   // - buckets: [[50, 1], [100, 3], [150, 4], [200, 5], ...]
 *   // - count: 5, min: 25, max: 200, sum: 500
 *   // - Useful for calculating percentiles, averages, etc.
 *
 *   return { responseTimeState, payloadSizeState }
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
const exportName = "histogram";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Represents a `Histogram` metric that records observations into buckets.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass HistogramError extends Data.TaggedError("HistogramError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a histogram for API response times\n  const responseTimeHistogram = Metric.histogram("api_response_time", {\n    description: "Distribution of API response times in milliseconds",\n    boundaries: Metric.linearBoundaries({ start: 0, width: 50, count: 10 })\n    // Creates buckets: 0-50ms, 50-100ms, 100-150ms, ..., 400-450ms, 450ms+\n  })\n\n  // Create a histogram for request payload sizes\n  const payloadSizeHistogram = Metric.histogram("payload_size", {\n    description: "Distribution of request payload sizes in KB",\n    boundaries: Metric.exponentialBoundaries({ start: 1, factor: 2, count: 8 }),\n    // Creates exponential buckets: 1KB, 2KB, 4KB, 8KB, 16KB, 32KB, 64KB, 128KB+\n    attributes: { service: "api-gateway" }\n  })\n\n  // Create a histogram with custom boundaries\n  const customHistogram = Metric.histogram("custom_metric", {\n    description: "Custom distribution metric",\n    boundaries: [0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 100]\n  })\n\n  // Record various response times\n  yield* Metric.update(responseTimeHistogram, 25) // Goes in 0-50ms bucket\n  yield* Metric.update(responseTimeHistogram, 75) // Goes in 50-100ms bucket\n  yield* Metric.update(responseTimeHistogram, 125) // Goes in 100-150ms bucket\n  yield* Metric.update(responseTimeHistogram, 200) // Goes in 150-200ms bucket\n  yield* Metric.update(responseTimeHistogram, 75) // Another 50-100ms\n\n  // Record payload sizes\n  yield* Metric.update(payloadSizeHistogram, 3) // Goes in 2-4KB bucket\n  yield* Metric.update(payloadSizeHistogram, 15) // Goes in 8-16KB bucket\n  yield* Metric.update(payloadSizeHistogram, 0.5) // Goes in 0-1KB bucket\n\n  // Get histogram state with distribution data\n  const responseTimeState = yield* Metric.value(responseTimeHistogram)\n  const payloadSizeState = yield* Metric.value(payloadSizeHistogram)\n\n  // responseTimeState will contain:\n  // - buckets: [[50, 1], [100, 3], [150, 4], [200, 5], ...]\n  // - count: 5, min: 25, max: 200, sum: 500\n  // - Useful for calculating percentiles, averages, etc.\n\n  return { responseTimeState, payloadSizeState }\n})';
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
