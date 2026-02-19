/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: SummaryState
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.962Z
 *
 * Overview:
 * State interface for Summary metrics containing quantile calculations and aggregate statistics.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class SummaryStateError extends Data.TaggedError("SummaryStateError")<{
 *   readonly operation: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   // Create summary with specific quantiles
 *   const responseTimeSummary = Metric.summary("api_response_latency", {
 *     description: "API response time distribution with quantiles",
 *     maxAge: "5 minutes",
 *     maxSize: 1000,
 *     quantiles: [0.5, 0.95, 0.99] // Track median, 95th, and 99th percentiles
 *   })
 * 
 *   // Record observations over time
 *   yield* Metric.update(responseTimeSummary, 120) // Fast response
 *   yield* Metric.update(responseTimeSummary, 250) // Average response
 *   yield* Metric.update(responseTimeSummary, 45) // Very fast response
 *   yield* Metric.update(responseTimeSummary, 890) // Slow response
 *   yield* Metric.update(responseTimeSummary, 156) // Average response
 *   yield* Metric.update(responseTimeSummary, 78) // Fast response
 *   yield* Metric.update(responseTimeSummary, 340) // Slower response
 * 
 *   // Read summary state
 *   const state: Metric.SummaryState = yield* Metric.value(responseTimeSummary)
 * 
 *   // SummaryState contains:
 *   // - quantiles: Array of [quantile, optionalValue] pairs showing percentile values
 *   // - count: total number of observations in current window
 *   // - min: smallest observed value in window
 *   // - max: largest observed value in window
 *   // - sum: sum of all observed values in window
 * 
 *   // Extract quantile information safely
 *   const extractQuantiles = (
 *     quantiles: ReadonlyArray<readonly [number, number | undefined]>
 *   ) => {
 *     const result: Record<string, number | null> = {}
 *     for (const [quantile, valueOption] of quantiles) {
 *       const percentile = Math.round(quantile * 100)
 *       result[`p${percentile}`] = valueOption ?? null
 *     }
 *     return result
 *   }
 * 
 *   const quantileValues = extractQuantiles(state.quantiles)
 * 
 *   return {
 *     latencyAnalysis: {
 *       totalRequests: state.count, // 7
 *       fastestResponse: state.min, // 45
 *       slowestResponse: state.max, // 890
 *       averageResponse: state.sum / state.count, // ~268.4
 *       totalLatency: state.sum, // 1879
 *       percentiles: quantileValues,
 *       // Example percentiles:
 *       // { p50: 156, p95: 890, p99: 890 }
 *       performance: {
 *         fast: quantileValues.p50 !== null && quantileValues.p50 < 200
 *           ? "Good"
 *           : "Needs improvement",
 *         reliability: quantileValues.p95 !== null && quantileValues.p95 < 500
 *           ? "Reliable"
 *           : "Concerning"
 *       }
 *     }
 *   }
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MetricModule from "effect/Metric";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SummaryState";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "State interface for Summary metrics containing quantile calculations and aggregate statistics.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass SummaryStateError extends Data.TaggedError(\"SummaryStateError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create summary with specific quantiles\n  const responseTimeSummary = Metric.summary(\"api_response_latency\", {\n    description: \"API response time distribution with quantiles\",\n    maxAge: \"5 minutes\",\n    maxSize: 1000,\n    quantiles: [0.5, 0.95, 0.99] // Track median, 95th, and 99th percentiles\n  })\n\n  // Record observations over time\n  yield* Metric.update(responseTimeSummary, 120) // Fast response\n  yield* Metric.update(responseTimeSummary, 250) // Average response\n  yield* Metric.update(responseTimeSummary, 45) // Very fast response\n  yield* Metric.update(responseTimeSummary, 890) // Slow response\n  yield* Metric.update(responseTimeSummary, 156) // Average response\n  yield* Metric.update(responseTimeSummary, 78) // Fast response\n  yield* Metric.update(responseTimeSummary, 340) // Slower response\n\n  // Read summary state\n  const state: Metric.SummaryState = yield* Metric.value(responseTimeSummary)\n\n  // SummaryState contains:\n  // - quantiles: Array of [quantile, optionalValue] pairs showing percentile values\n  // - count: total number of observations in current window\n  // - min: smallest observed value in window\n  // - max: largest observed value in window\n  // - sum: sum of all observed values in window\n\n  // Extract quantile information safely\n  const extractQuantiles = (\n    quantiles: ReadonlyArray<readonly [number, number | undefined]>\n  ) => {\n    const result: Record<string, number | null> = {}\n    for (const [quantile, valueOption] of quantiles) {\n      const percentile = Math.round(quantile * 100)\n      result[`p${percentile}`] = valueOption ?? null\n    }\n    return result\n  }\n\n  const quantileValues = extractQuantiles(state.quantiles)\n\n  return {\n    latencyAnalysis: {\n      totalRequests: state.count, // 7\n      fastestResponse: state.min, // 45\n      slowestResponse: state.max, // 890\n      averageResponse: state.sum / state.count, // ~268.4\n      totalLatency: state.sum, // 1879\n      percentiles: quantileValues,\n      // Example percentiles:\n      // { p50: 156, p95: 890, p99: 890 }\n      performance: {\n        fast: quantileValues.p50 !== null && quantileValues.p50 < 200\n          ? \"Good\"\n          : \"Needs improvement\",\n        reliability: quantileValues.p95 !== null && quantileValues.p95 < 500\n          ? \"Reliable\"\n          : \"Concerning\"\n      }\n    }\n  }\n})";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
