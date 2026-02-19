/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: summary
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.962Z
 *
 * Overview:
 * Creates a `Summary` metric that records observations and calculates quantiles which takes a value as input and uses the current time.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Duration, Effect, Metric } from "effect"
 *
 * class SummaryError extends Data.TaggedError("SummaryError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a summary for API response times
 *   const responseTimeSummary = Metric.summary("api_response_time", {
 *     description: "API response time quantiles over 5-minute windows",
 *     maxAge: Duration.minutes(5), // Keep observations for 5 minutes
 *     maxSize: 1000, // Maximum 1000 observations in memory
 *     quantiles: [0.5, 0.9, 0.95, 0.99] // 50th, 90th, 95th, 99th percentiles
 *   })
 *
 *   // Create a summary for request payload sizes
 *   const payloadSizeSummary = Metric.summary("request_payload_size", {
 *     description: "Request payload size distribution over 2-minute windows",
 *     maxAge: Duration.minutes(2), // Shorter window for recent trends
 *     maxSize: 500, // Smaller buffer for memory efficiency
 *     quantiles: [0.5, 0.75, 0.9], // Median, 75th, 90th percentiles
 *     attributes: { service: "upload-service" }
 *   })
 *
 *   // Simulate recording various response times over time
 *   for (let i = 0; i < 20; i++) {
 *     const responseTime = 50 + Math.random() * 200 // 50-250ms
 *     yield* Metric.update(responseTimeSummary, responseTime)
 *
 *     // Wait a bit to simulate different timestamps
 *     yield* Effect.sleep(Duration.millis(100))
 *   }
 *
 *   // Record some payload sizes
 *   yield* Metric.update(payloadSizeSummary, 1.2) // 1.2KB
 *   yield* Metric.update(payloadSizeSummary, 5.8) // 5.8KB
 *   yield* Metric.update(payloadSizeSummary, 15.6) // 15.6KB
 *   yield* Metric.update(payloadSizeSummary, 3.4) // 3.4KB
 *
 *   // Get summary statistics with quantiles
 *   const responseStats = yield* Metric.value(responseTimeSummary)
 *   const payloadStats = yield* Metric.value(payloadSizeSummary)
 *
 *   // responseStats will contain:
 *   // - quantiles: [[0.5, Some(125)], [0.9, Some(220)], [0.95, Some(235)], [0.99, Some(245)]]
 *   // - count: 20, min: ~50, max: ~250, sum: ~2500
 *   // - Only observations from the last 5 minutes are included
 *
 *   // payloadStats will contain quantile information for recent payload sizes
 *   // Older observations automatically age out based on maxAge setting
 *
 *   return { responseStats, payloadStats }
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
const exportName = "summary";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary =
  "Creates a `Summary` metric that records observations and calculates quantiles which takes a value as input and uses the current time.";
const sourceExample =
  'import { Data, Duration, Effect, Metric } from "effect"\n\nclass SummaryError extends Data.TaggedError("SummaryError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a summary for API response times\n  const responseTimeSummary = Metric.summary("api_response_time", {\n    description: "API response time quantiles over 5-minute windows",\n    maxAge: Duration.minutes(5), // Keep observations for 5 minutes\n    maxSize: 1000, // Maximum 1000 observations in memory\n    quantiles: [0.5, 0.9, 0.95, 0.99] // 50th, 90th, 95th, 99th percentiles\n  })\n\n  // Create a summary for request payload sizes\n  const payloadSizeSummary = Metric.summary("request_payload_size", {\n    description: "Request payload size distribution over 2-minute windows",\n    maxAge: Duration.minutes(2), // Shorter window for recent trends\n    maxSize: 500, // Smaller buffer for memory efficiency\n    quantiles: [0.5, 0.75, 0.9], // Median, 75th, 90th percentiles\n    attributes: { service: "upload-service" }\n  })\n\n  // Simulate recording various response times over time\n  for (let i = 0; i < 20; i++) {\n    const responseTime = 50 + Math.random() * 200 // 50-250ms\n    yield* Metric.update(responseTimeSummary, responseTime)\n\n    // Wait a bit to simulate different timestamps\n    yield* Effect.sleep(Duration.millis(100))\n  }\n\n  // Record some payload sizes\n  yield* Metric.update(payloadSizeSummary, 1.2) // 1.2KB\n  yield* Metric.update(payloadSizeSummary, 5.8) // 5.8KB\n  yield* Metric.update(payloadSizeSummary, 15.6) // 15.6KB\n  yield* Metric.update(payloadSizeSummary, 3.4) // 3.4KB\n\n  // Get summary statistics with quantiles\n  const responseStats = yield* Metric.value(responseTimeSummary)\n  const payloadStats = yield* Metric.value(payloadSizeSummary)\n\n  // responseStats will contain:\n  // - quantiles: [[0.5, Some(125)], [0.9, Some(220)], [0.95, Some(235)], [0.99, Some(245)]]\n  // - count: 20, min: ~50, max: ~250, sum: ~2500\n  // - Only observations from the last 5 minutes are included\n\n  // payloadStats will contain quantile information for recent payload sizes\n  // Older observations automatically age out based on maxAge setting\n\n  return { responseStats, payloadStats }\n})';
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
