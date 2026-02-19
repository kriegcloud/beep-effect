/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: disableRuntimeMetrics
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.744Z
 *
 * Overview:
 * Disables automatic collection of fiber runtime metrics for the provided Effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Data, Effect, Layer, Metric } from "effect"
 *
 * class DisableMetricsError extends Data.TaggedError("DisableMetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // This section will have runtime metrics enabled
 *   const normalOperation = Effect.gen(function*() {
 *     const tasks = Array.from({ length: 5 }, (_, i) =>
 *       Effect.gen(function*() {
 *         yield* Effect.sleep(`${100 + i * 20} millis`)
 *         return `Normal task ${i} completed`
 *       }))
 *     return yield* Effect.all(tasks, { concurrency: 3 })
 *   })
 *
 *   // This section will have runtime metrics disabled for performance
 *   const highPerformanceOperation = Metric.disableRuntimeMetrics(
 *     Effect.gen(function*() {
 *       // Performance-critical code where metrics overhead should be avoided
 *       const hotPath = Array.from(
 *         { length: 1000 },
 *         (_, i) =>
 *           Effect.gen(function*() {
 *             // Simulate intensive computation
 *             const result = i * i + Math.random()
 *             return result
 *           })
 *       )
 *       return yield* Effect.all(hotPath, { concurrency: 100 })
 *     })
 *   )
 *
 *   yield* Console.log("Running operations with selective metrics...")
 *
 *   // Run both operations
 *   const [normalResults, performanceResults] = yield* Effect.all([
 *     normalOperation, // Will generate fiber metrics
 *     highPerformanceOperation // Will NOT generate fiber metrics
 *   ])
 *
 *   // Check collected metrics - should only see metrics from normalOperation
 *   const metrics = yield* Metric.snapshot
 *   const runtimeMetrics = metrics.filter((m) => m.id.startsWith("child_fiber"))
 *
 *   yield* Console.log(`Normal operation results: ${normalResults.length}`)
 *   yield* Console.log(
 *     `Performance operation results: ${performanceResults.length}`
 *   )
 *   yield* Console.log(`Runtime metrics collected: ${runtimeMetrics.length}`)
 *
 *   // The runtime metrics will only reflect the fibers from normalOperation
 *   // The highPerformanceOperation fibers were not tracked due to disableRuntimeMetrics
 *
 *   return { normalResults, performanceResults, runtimeMetrics }
 * })
 *
 * // Enable runtime metrics globally, then selectively disable where needed
 * const BaseAppLayer = Layer.empty // Your base application layers
 * const AppLayerWithMetrics = BaseAppLayer.pipe(
 *   Layer.provide(Metric.enableRuntimeMetricsLayer)
 * )
 * const finalProgram = program.pipe(
 *   Effect.provide(AppLayerWithMetrics)
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
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "disableRuntimeMetrics";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Disables automatic collection of fiber runtime metrics for the provided Effect.";
const sourceExample =
  'import { Console, Data, Effect, Layer, Metric } from "effect"\n\nclass DisableMetricsError extends Data.TaggedError("DisableMetricsError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // This section will have runtime metrics enabled\n  const normalOperation = Effect.gen(function*() {\n    const tasks = Array.from({ length: 5 }, (_, i) =>\n      Effect.gen(function*() {\n        yield* Effect.sleep(`${100 + i * 20} millis`)\n        return `Normal task ${i} completed`\n      }))\n    return yield* Effect.all(tasks, { concurrency: 3 })\n  })\n\n  // This section will have runtime metrics disabled for performance\n  const highPerformanceOperation = Metric.disableRuntimeMetrics(\n    Effect.gen(function*() {\n      // Performance-critical code where metrics overhead should be avoided\n      const hotPath = Array.from(\n        { length: 1000 },\n        (_, i) =>\n          Effect.gen(function*() {\n            // Simulate intensive computation\n            const result = i * i + Math.random()\n            return result\n          })\n      )\n      return yield* Effect.all(hotPath, { concurrency: 100 })\n    })\n  )\n\n  yield* Console.log("Running operations with selective metrics...")\n\n  // Run both operations\n  const [normalResults, performanceResults] = yield* Effect.all([\n    normalOperation, // Will generate fiber metrics\n    highPerformanceOperation // Will NOT generate fiber metrics\n  ])\n\n  // Check collected metrics - should only see metrics from normalOperation\n  const metrics = yield* Metric.snapshot\n  const runtimeMetrics = metrics.filter((m) => m.id.startsWith("child_fiber"))\n\n  yield* Console.log(`Normal operation results: ${normalResults.length}`)\n  yield* Console.log(\n    `Performance operation results: ${performanceResults.length}`\n  )\n  yield* Console.log(`Runtime metrics collected: ${runtimeMetrics.length}`)\n\n  // The runtime metrics will only reflect the fibers from normalOperation\n  // The highPerformanceOperation fibers were not tracked due to disableRuntimeMetrics\n\n  return { normalResults, performanceResults, runtimeMetrics }\n})\n\n// Enable runtime metrics globally, then selectively disable where needed\nconst BaseAppLayer = Layer.empty // Your base application layers\nconst AppLayerWithMetrics = BaseAppLayer.pipe(\n  Layer.provide(Metric.enableRuntimeMetricsLayer)\n)\nconst finalProgram = program.pipe(\n  Effect.provide(AppLayerWithMetrics)\n)';
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
