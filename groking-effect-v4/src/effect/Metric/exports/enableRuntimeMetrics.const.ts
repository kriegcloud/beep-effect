/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: enableRuntimeMetrics
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * Enables automatic collection of fiber runtime metrics for the provided Effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Data, Effect, Layer, Metric } from "effect"
 * 
 * class RuntimeMetricsError extends Data.TaggedError("RuntimeMetricsError")<{
 *   readonly operation: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   // Create a concurrent workload to demonstrate fiber metrics
 *   const heavyWorkload = Effect.gen(function*() {
 *     // Simulate concurrent operations
 *     const tasks = Array.from({ length: 10 }, (_, i) =>
 *       Effect.gen(function*() {
 *         yield* Effect.sleep(`${100 + i * 50} millis`)
 *         if (i % 4 === 0) {
 *           // Simulate some failures
 *           yield* Effect.fail(
 *             new RuntimeMetricsError({ operation: `task-${i}` })
 *           )
 *         }
 *         return `Task ${i} completed`
 *       }).pipe(
 *         Effect.catchTag("RuntimeMetricsError", () =>
 *           Effect.succeed(`Task ${i} failed`))
 *       ))
 * 
 *     // Run tasks concurrently
 *     const results = yield* Effect.all(tasks, { concurrency: 5 })
 *     return results
 *   })
 * 
 *   // Enable runtime metrics collection for our workload
 *   const workloadWithMetrics = Metric.enableRuntimeMetrics(heavyWorkload)
 * 
 *   // Execute the workload
 *   const results = yield* workloadWithMetrics
 * 
 *   // After execution, we can inspect the runtime metrics
 *   // The following metrics are automatically collected:
 *   // - child_fibers_active: Current number of active child fibers (Gauge)
 *   // - child_fibers_started: Total child fibers started (Counter, incremental)
 *   // - child_fiber_successes: Total successful child fibers (Counter, incremental)
 *   // - child_fiber_failures: Total failed child fibers (Counter, incremental)
 * 
 *   yield* Console.log(`Workload completed with ${results.length} results`)
 * 
 *   // Get all metrics including the runtime metrics
 *   const allMetrics = yield* Metric.snapshot
 *   const runtimeMetrics = allMetrics.filter((m) =>
 *     m.id.startsWith("child_fiber") || m.id.includes("fiber")
 *   )
 * 
 *   yield* Console.log("Runtime Metrics:")
 *   for (const metric of runtimeMetrics) {
 *     yield* Console.log(`  ${metric.id}: ${JSON.stringify(metric.state)}`)
 *   }
 * 
 *   return results
 * })
 * 
 * // Alternative: Use the layer version for broader application coverage
 * const BaseAppLayer = Layer.empty // Your base application layers
 * const AppLayerWithMetrics = BaseAppLayer.pipe(
 *   Layer.provide(Metric.enableRuntimeMetricsLayer)
 * )
 * const programWithLayer = program.pipe(
 *   Effect.provide(AppLayerWithMetrics)
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as MetricModule from "effect/Metric";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "enableRuntimeMetrics";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Enables automatic collection of fiber runtime metrics for the provided Effect.";
const sourceExample = "import { Console, Data, Effect, Layer, Metric } from \"effect\"\n\nclass RuntimeMetricsError extends Data.TaggedError(\"RuntimeMetricsError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a concurrent workload to demonstrate fiber metrics\n  const heavyWorkload = Effect.gen(function*() {\n    // Simulate concurrent operations\n    const tasks = Array.from({ length: 10 }, (_, i) =>\n      Effect.gen(function*() {\n        yield* Effect.sleep(`${100 + i * 50} millis`)\n        if (i % 4 === 0) {\n          // Simulate some failures\n          yield* Effect.fail(\n            new RuntimeMetricsError({ operation: `task-${i}` })\n          )\n        }\n        return `Task ${i} completed`\n      }).pipe(\n        Effect.catchTag(\"RuntimeMetricsError\", () =>\n          Effect.succeed(`Task ${i} failed`))\n      ))\n\n    // Run tasks concurrently\n    const results = yield* Effect.all(tasks, { concurrency: 5 })\n    return results\n  })\n\n  // Enable runtime metrics collection for our workload\n  const workloadWithMetrics = Metric.enableRuntimeMetrics(heavyWorkload)\n\n  // Execute the workload\n  const results = yield* workloadWithMetrics\n\n  // After execution, we can inspect the runtime metrics\n  // The following metrics are automatically collected:\n  // - child_fibers_active: Current number of active child fibers (Gauge)\n  // - child_fibers_started: Total child fibers started (Counter, incremental)\n  // - child_fiber_successes: Total successful child fibers (Counter, incremental)\n  // - child_fiber_failures: Total failed child fibers (Counter, incremental)\n\n  yield* Console.log(`Workload completed with ${results.length} results`)\n\n  // Get all metrics including the runtime metrics\n  const allMetrics = yield* Metric.snapshot\n  const runtimeMetrics = allMetrics.filter((m) =>\n    m.id.startsWith(\"child_fiber\") || m.id.includes(\"fiber\")\n  )\n\n  yield* Console.log(\"Runtime Metrics:\")\n  for (const metric of runtimeMetrics) {\n    yield* Console.log(`  ${metric.id}: ${JSON.stringify(metric.state)}`)\n  }\n\n  return results\n})\n\n// Alternative: Use the layer version for broader application coverage\nconst BaseAppLayer = Layer.empty // Your base application layers\nconst AppLayerWithMetrics = BaseAppLayer.pipe(\n  Layer.provide(Metric.enableRuntimeMetricsLayer)\n)\nconst programWithLayer = program.pipe(\n  Effect.provide(AppLayerWithMetrics)\n)";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
