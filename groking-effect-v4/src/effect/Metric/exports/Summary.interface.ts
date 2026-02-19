/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: Summary
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.746Z
 *
 * Overview:
 * A Summary metric that calculates quantiles over a sliding time window of observations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class SummaryInterfaceError extends Data.TaggedError("SummaryInterfaceError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create summaries with different quantile configurations
 *   const responseTimeSummary: Metric.Summary<number> = Metric.summary(
 *     "api_response_time_ms",
 *     {
 *       description: "API response time distribution in milliseconds",
 *       maxAge: "5 minutes", // Keep observations for 5 minutes
 *       maxSize: 1000, // Keep up to 1000 observations
 *       quantiles: [0.5, 0.95, 0.99] // Track median, 95th, and 99th percentiles
 *     }
 *   )
 *
 *   const requestSizeSummary: Metric.Summary<number> = Metric.summary(
 *     "request_size_bytes",
 *     {
 *       description: "Request payload size distribution",
 *       maxAge: "10 minutes",
 *       maxSize: 500,
 *       quantiles: [0.25, 0.5, 0.75, 0.9] // Track quartiles and 90th percentile
 *     }
 *   )
 *
 *   // Record observations (values are stored in time-based sliding window)
 *   yield* Metric.update(responseTimeSummary, 120) // Fast response
 *   yield* Metric.update(responseTimeSummary, 250) // Average response
 *   yield* Metric.update(responseTimeSummary, 45) // Very fast response
 *   yield* Metric.update(responseTimeSummary, 890) // Slow response
 *   yield* Metric.update(responseTimeSummary, 156) // Average response
 *
 *   yield* Metric.update(requestSizeSummary, 1024) // 1KB request
 *   yield* Metric.update(requestSizeSummary, 512) // 512B request
 *   yield* Metric.update(requestSizeSummary, 2048) // 2KB request
 *
 *   // Read summary state
 *   const responseTimeState: Metric.SummaryState = yield* Metric.value(
 *     responseTimeSummary
 *   )
 *   const requestSizeState: Metric.SummaryState = yield* Metric.value(
 *     requestSizeSummary
 *   )
 *
 *   // Summary state contains:
 *   // - quantiles: Array of [quantile, optionalValue] pairs
 *   // - count: total number of observations in window
 *   // - min: smallest observed value in window
 *   // - max: largest observed value in window
 *   // - sum: sum of all observed values in window
 *
 *   // Extract quantile values safely
 *   const getQuantileValue = (
 *     quantiles: ReadonlyArray<readonly [number, number | undefined]>,
 *     q: number
 *   ) => quantiles.find(([quantile]) => quantile === q)?.[1]
 *
 *   const median = getQuantileValue(responseTimeState.quantiles, 0.5)
 *   const p95 = getQuantileValue(responseTimeState.quantiles, 0.95)
 *   const p99 = getQuantileValue(responseTimeState.quantiles, 0.99)
 *
 *   return {
 *     responseTime: {
 *       totalRequests: responseTimeState.count, // 5
 *       fastestResponse: responseTimeState.min, // 45
 *       slowestResponse: responseTimeState.max, // 890
 *       totalTime: responseTimeState.sum, // 1461
 *       averageTime: responseTimeState.sum / responseTimeState.count, // 292.2
 *       medianTime: median ?? null, // ~156
 *       p95Time: p95 ?? null, // ~890
 *       p99Time: p99 ?? null // ~890
 *     },
 *     requestSize: {
 *       totalRequests: requestSizeState.count, // 3
 *       averageSize: requestSizeState.sum / requestSizeState.count // ~1194.7
 *     }
 *   }
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Summary";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A Summary metric that calculates quantiles over a sliding time window of observations.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass SummaryInterfaceError extends Data.TaggedError("SummaryInterfaceError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create summaries with different quantile configurations\n  const responseTimeSummary: Metric.Summary<number> = Metric.summary(\n    "api_response_time_ms",\n    {\n      description: "API response time distribution in milliseconds",\n      maxAge: "5 minutes", // Keep observations for 5 minutes\n      maxSize: 1000, // Keep up to 1000 observations\n      quantiles: [0.5, 0.95, 0.99] // Track median, 95th, and 99th percentiles\n    }\n  )\n\n  const requestSizeSummary: Metric.Summary<number> = Metric.summary(\n    "request_size_bytes",\n    {\n      description: "Request payload size distribution",\n      maxAge: "10 minutes",\n      maxSize: 500,\n      quantiles: [0.25, 0.5, 0.75, 0.9] // Track quartiles and 90th percentile\n    }\n  )\n\n  // Record observations (values are stored in time-based sliding window)\n  yield* Metric.update(responseTimeSummary, 120) // Fast response\n  yield* Metric.update(responseTimeSummary, 250) // Average response\n  yield* Metric.update(responseTimeSummary, 45) // Very fast response\n  yield* Metric.update(responseTimeSummary, 890) // Slow response\n  yield* Metric.update(responseTimeSummary, 156) // Average response\n\n  yield* Metric.update(requestSizeSummary, 1024) // 1KB request\n  yield* Metric.update(requestSizeSummary, 512) // 512B request\n  yield* Metric.update(requestSizeSummary, 2048) // 2KB request\n\n  // Read summary state\n  const responseTimeState: Metric.SummaryState = yield* Metric.value(\n    responseTimeSummary\n  )\n  const requestSizeState: Metric.SummaryState = yield* Metric.value(\n    requestSizeSummary\n  )\n\n  // Summary state contains:\n  // - quantiles: Array of [quantile, optionalValue] pairs\n  // - count: total number of observations in window\n  // - min: smallest observed value in window\n  // - max: largest observed value in window\n  // - sum: sum of all observed values in window\n\n  // Extract quantile values safely\n  const getQuantileValue = (\n    quantiles: ReadonlyArray<readonly [number, number | undefined]>,\n    q: number\n  ) => quantiles.find(([quantile]) => quantile === q)?.[1]\n\n  const median = getQuantileValue(responseTimeState.quantiles, 0.5)\n  const p95 = getQuantileValue(responseTimeState.quantiles, 0.95)\n  const p99 = getQuantileValue(responseTimeState.quantiles, 0.99)\n\n  return {\n    responseTime: {\n      totalRequests: responseTimeState.count, // 5\n      fastestResponse: responseTimeState.min, // 45\n      slowestResponse: responseTimeState.max, // 890\n      totalTime: responseTimeState.sum, // 1461\n      averageTime: responseTimeState.sum / responseTimeState.count, // 292.2\n      medianTime: median ?? null, // ~156\n      p95Time: p95 ?? null, // ~890\n      p99Time: p99 ?? null // ~890\n    },\n    requestSize: {\n      totalRequests: requestSizeState.count, // 3\n      averageSize: requestSizeState.sum / requestSizeState.count // ~1194.7\n    }\n  }\n})';
const moduleRecord = MetricModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
