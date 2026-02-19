/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: Histogram
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.961Z
 *
 * Overview:
 * A Histogram metric that records observations in configurable buckets to analyze value distributions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class HistogramInterfaceError
 *   extends Data.TaggedError("HistogramInterfaceError")<{
 *     readonly operation: string
 *   }>
 * {}
 * 
 * const program = Effect.gen(function*() {
 *   // Create histograms with different boundary strategies
 *   const responseTimeHistogram: Metric.Histogram<number> = Metric.histogram(
 *     "http_response_time_ms",
 *     {
 *       description: "HTTP response time distribution in milliseconds",
 *       boundaries: Metric.linearBoundaries({ start: 0, width: 50, count: 20 }) // 0, 50, 100, ..., 950
 *     }
 *   )
 * 
 *   const fileSizeHistogram: Metric.Histogram<number> = Metric.histogram(
 *     "file_size_bytes",
 *     {
 *       description: "File size distribution in bytes",
 *       boundaries: Metric.exponentialBoundaries({
 *         start: 1,
 *         factor: 2,
 *         count: 10
 *       }) // 1, 2, 4, 8, ..., 512
 *     }
 *   )
 * 
 *   // Record observations (values get placed into appropriate buckets)
 *   yield* Metric.update(responseTimeHistogram, 125) // Goes into 100-150ms bucket
 *   yield* Metric.update(responseTimeHistogram, 75) // Goes into 50-100ms bucket
 *   yield* Metric.update(responseTimeHistogram, 200) // Goes into 150-200ms bucket
 *   yield* Metric.update(responseTimeHistogram, 45) // Goes into 0-50ms bucket
 * 
 *   yield* Metric.update(fileSizeHistogram, 3) // Goes into 2-4 bytes bucket
 *   yield* Metric.update(fileSizeHistogram, 15) // Goes into 8-16 bytes bucket
 *   yield* Metric.update(fileSizeHistogram, 100) // Goes into 64-128 bytes bucket
 * 
 *   // Read histogram state
 *   const responseTimeState: Metric.HistogramState = yield* Metric.value(
 *     responseTimeHistogram
 *   )
 *   const fileSizeState: Metric.HistogramState = yield* Metric.value(
 *     fileSizeHistogram
 *   )
 * 
 *   // Histogram state contains:
 *   // - buckets: Array of [boundary, cumulativeCount] pairs
 *   // - count: total number of observations
 *   // - min: smallest observed value
 *   // - max: largest observed value
 *   // - sum: sum of all observed values
 * 
 *   return {
 *     responseTime: {
 *       totalRequests: responseTimeState.count, // 4
 *       fastestRequest: responseTimeState.min, // 45
 *       slowestRequest: responseTimeState.max, // 200
 *       totalTime: responseTimeState.sum, // 445
 *       averageTime: responseTimeState.sum / responseTimeState.count // 111.25
 *     },
 *     fileSize: {
 *       totalFiles: fileSizeState.count, // 3
 *       smallestFile: fileSizeState.min, // 3
 *       largestFile: fileSizeState.max, // 100
 *       totalBytes: fileSizeState.sum // 118
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
const exportName = "Histogram";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A Histogram metric that records observations in configurable buckets to analyze value distributions.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass HistogramInterfaceError\n  extends Data.TaggedError(\"HistogramInterfaceError\")<{\n    readonly operation: string\n  }>\n{}\n\nconst program = Effect.gen(function*() {\n  // Create histograms with different boundary strategies\n  const responseTimeHistogram: Metric.Histogram<number> = Metric.histogram(\n    \"http_response_time_ms\",\n    {\n      description: \"HTTP response time distribution in milliseconds\",\n      boundaries: Metric.linearBoundaries({ start: 0, width: 50, count: 20 }) // 0, 50, 100, ..., 950\n    }\n  )\n\n  const fileSizeHistogram: Metric.Histogram<number> = Metric.histogram(\n    \"file_size_bytes\",\n    {\n      description: \"File size distribution in bytes\",\n      boundaries: Metric.exponentialBoundaries({\n        start: 1,\n        factor: 2,\n        count: 10\n      }) // 1, 2, 4, 8, ..., 512\n    }\n  )\n\n  // Record observations (values get placed into appropriate buckets)\n  yield* Metric.update(responseTimeHistogram, 125) // Goes into 100-150ms bucket\n  yield* Metric.update(responseTimeHistogram, 75) // Goes into 50-100ms bucket\n  yield* Metric.update(responseTimeHistogram, 200) // Goes into 150-200ms bucket\n  yield* Metric.update(responseTimeHistogram, 45) // Goes into 0-50ms bucket\n\n  yield* Metric.update(fileSizeHistogram, 3) // Goes into 2-4 bytes bucket\n  yield* Metric.update(fileSizeHistogram, 15) // Goes into 8-16 bytes bucket\n  yield* Metric.update(fileSizeHistogram, 100) // Goes into 64-128 bytes bucket\n\n  // Read histogram state\n  const responseTimeState: Metric.HistogramState = yield* Metric.value(\n    responseTimeHistogram\n  )\n  const fileSizeState: Metric.HistogramState = yield* Metric.value(\n    fileSizeHistogram\n  )\n\n  // Histogram state contains:\n  // - buckets: Array of [boundary, cumulativeCount] pairs\n  // - count: total number of observations\n  // - min: smallest observed value\n  // - max: largest observed value\n  // - sum: sum of all observed values\n\n  return {\n    responseTime: {\n      totalRequests: responseTimeState.count, // 4\n      fastestRequest: responseTimeState.min, // 45\n      slowestRequest: responseTimeState.max, // 200\n      totalTime: responseTimeState.sum, // 445\n      averageTime: responseTimeState.sum / responseTimeState.count // 111.25\n    },\n    fileSize: {\n      totalFiles: fileSizeState.count, // 3\n      smallestFile: fileSizeState.min, // 3\n      largestFile: fileSizeState.max, // 100\n      totalBytes: fileSizeState.sum // 118\n    }\n  }\n})";
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
