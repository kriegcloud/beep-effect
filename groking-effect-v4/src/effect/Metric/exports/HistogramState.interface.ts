/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: HistogramState
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.745Z
 *
 * Overview:
 * State interface for Histogram metrics containing bucket distributions and aggregate statistics.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class HistogramStateError extends Data.TaggedError("HistogramStateError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create histogram with linear boundaries
 *   const responseTimeHistogram = Metric.histogram("api_response_time_ms", {
 *     description: "API response time distribution",
 *     boundaries: Metric.linearBoundaries({ start: 0, width: 100, count: 10 }) // 0, 100, 200, ..., 900
 *   })
 *
 *   // Record observations
 *   yield* Metric.update(responseTimeHistogram, 50) // Fast response
 *   yield* Metric.update(responseTimeHistogram, 150) // Average response
 *   yield* Metric.update(responseTimeHistogram, 750) // Slow response
 *   yield* Metric.update(responseTimeHistogram, 250) // Average response
 *   yield* Metric.update(responseTimeHistogram, 95) // Fast response
 *
 *   // Read histogram state
 *   const state: Metric.HistogramState = yield* Metric.value(
 *     responseTimeHistogram
 *   )
 *
 *   // HistogramState contains:
 *   // - buckets: Array of [boundary, cumulativeCount] pairs showing distribution
 *   // - count: total number of observations
 *   // - min: smallest observed value
 *   // - max: largest observed value
 *   // - sum: sum of all observed values
 *
 *   // Analyze bucket distribution
 *   const analyzeBuckets = (buckets: ReadonlyArray<[number, number]>) => {
 *     const analysis: Array<
 *       { range: string; count: number; percentage: number }
 *     > = []
 *     let previousCount = 0
 *     const totalCount = buckets[buckets.length - 1]?.[1] ?? 0
 *
 *     for (let i = 0; i < buckets.length; i++) {
 *       const [boundary, cumulativeCount] = buckets[i]
 *       const bucketCount = cumulativeCount - previousCount
 *       const percentage = totalCount > 0 ? (bucketCount / totalCount) * 100 : 0
 *       const prevBoundary = i === 0 ? 0 : buckets[i - 1][0]
 *
 *       analysis.push({
 *         range: `${prevBoundary}-${boundary}ms`,
 *         count: bucketCount,
 *         percentage: Math.round(percentage * 10) / 10
 *       })
 *       previousCount = cumulativeCount
 *     }
 *     return analysis
 *   }
 *
 *   const bucketAnalysis = analyzeBuckets(state.buckets)
 *
 *   return {
 *     responseTime: {
 *       totalRequests: state.count, // 5
 *       fastestResponse: state.min, // 50
 *       slowestResponse: state.max, // 750
 *       averageResponse: state.sum / state.count, // 268
 *       totalTime: state.sum, // 1340
 *       distribution: bucketAnalysis
 *       // Example distribution:
 *       // [{ range: "0-100ms", count: 2, percentage: 40.0 },
 *       //  { range: "100-200ms", count: 1, percentage: 20.0 },
 *       //  { range: "200-300ms", count: 1, percentage: 20.0 },
 *       //  { range: "700-800ms", count: 1, percentage: 20.0 }]
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
const exportName = "HistogramState";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "State interface for Histogram metrics containing bucket distributions and aggregate statistics.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass HistogramStateError extends Data.TaggedError("HistogramStateError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create histogram with linear boundaries\n  const responseTimeHistogram = Metric.histogram("api_response_time_ms", {\n    description: "API response time distribution",\n    boundaries: Metric.linearBoundaries({ start: 0, width: 100, count: 10 }) // 0, 100, 200, ..., 900\n  })\n\n  // Record observations\n  yield* Metric.update(responseTimeHistogram, 50) // Fast response\n  yield* Metric.update(responseTimeHistogram, 150) // Average response\n  yield* Metric.update(responseTimeHistogram, 750) // Slow response\n  yield* Metric.update(responseTimeHistogram, 250) // Average response\n  yield* Metric.update(responseTimeHistogram, 95) // Fast response\n\n  // Read histogram state\n  const state: Metric.HistogramState = yield* Metric.value(\n    responseTimeHistogram\n  )\n\n  // HistogramState contains:\n  // - buckets: Array of [boundary, cumulativeCount] pairs showing distribution\n  // - count: total number of observations\n  // - min: smallest observed value\n  // - max: largest observed value\n  // - sum: sum of all observed values\n\n  // Analyze bucket distribution\n  const analyzeBuckets = (buckets: ReadonlyArray<[number, number]>) => {\n    const analysis: Array<\n      { range: string; count: number; percentage: number }\n    > = []\n    let previousCount = 0\n    const totalCount = buckets[buckets.length - 1]?.[1] ?? 0\n\n    for (let i = 0; i < buckets.length; i++) {\n      const [boundary, cumulativeCount] = buckets[i]\n      const bucketCount = cumulativeCount - previousCount\n      const percentage = totalCount > 0 ? (bucketCount / totalCount) * 100 : 0\n      const prevBoundary = i === 0 ? 0 : buckets[i - 1][0]\n\n      analysis.push({\n        range: `${prevBoundary}-${boundary}ms`,\n        count: bucketCount,\n        percentage: Math.round(percentage * 10) / 10\n      })\n      previousCount = cumulativeCount\n    }\n    return analysis\n  }\n\n  const bucketAnalysis = analyzeBuckets(state.buckets)\n\n  return {\n    responseTime: {\n      totalRequests: state.count, // 5\n      fastestResponse: state.min, // 50\n      slowestResponse: state.max, // 750\n      averageResponse: state.sum / state.count, // 268\n      totalTime: state.sum, // 1340\n      distribution: bucketAnalysis\n      // Example distribution:\n      // [{ range: "0-100ms", count: 2, percentage: 40.0 },\n      //  { range: "100-200ms", count: 1, percentage: 20.0 },\n      //  { range: "200-300ms", count: 1, percentage: 20.0 },\n      //  { range: "700-800ms", count: 1, percentage: 20.0 }]\n    }\n  }\n})';
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
