/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: FiberRuntimeMetrics
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.745Z
 *
 * Overview:
 * Service class for managing fiber runtime metrics collection.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class MetricsError extends Data.TaggedError("MetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Access the fiber runtime metrics service
 *   const metricsService = yield* Metric.FiberRuntimeMetrics
 *
 *   if (metricsService) {
 *     console.log("Runtime metrics are enabled")
 *   } else {
 *     console.log("Runtime metrics are disabled")
 *   }
 *
 *   // Enable runtime metrics for the application
 *   const enabledLayer = Metric.enableRuntimeMetricsLayer
 *
 *   return yield* Effect.gen(function*() {
 *     // Create some concurrent fibers to see metrics in action
 *     yield* Effect.all([
 *       Effect.sleep("100 millis"),
 *       Effect.sleep("200 millis"),
 *       Effect.sleep("300 millis")
 *     ], { concurrency: "unbounded" })
 *
 *     // Create test metrics to demonstrate the service
 *     const testCounter = Metric.counter("test_counter")
 *     yield* Metric.update(testCounter, 5)
 *     const counterValue = yield* Metric.value(testCounter)
 *
 *     return { counterValue, metricsEnabled: true }
 *   }).pipe(Effect.provide(enabledLayer))
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
const exportName = "FiberRuntimeMetrics";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Service class for managing fiber runtime metrics collection.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass MetricsError extends Data.TaggedError("MetricsError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Access the fiber runtime metrics service\n  const metricsService = yield* Metric.FiberRuntimeMetrics\n\n  if (metricsService) {\n    console.log("Runtime metrics are enabled")\n  } else {\n    console.log("Runtime metrics are disabled")\n  }\n\n  // Enable runtime metrics for the application\n  const enabledLayer = Metric.enableRuntimeMetricsLayer\n\n  return yield* Effect.gen(function*() {\n    // Create some concurrent fibers to see metrics in action\n    yield* Effect.all([\n      Effect.sleep("100 millis"),\n      Effect.sleep("200 millis"),\n      Effect.sleep("300 millis")\n    ], { concurrency: "unbounded" })\n\n    // Create test metrics to demonstrate the service\n    const testCounter = Metric.counter("test_counter")\n    yield* Metric.update(testCounter, 5)\n    const counterValue = yield* Metric.value(testCounter)\n\n    return { counterValue, metricsEnabled: true }\n  }).pipe(Effect.provide(enabledLayer))\n})';
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
