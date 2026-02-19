/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: disableRuntimeMetricsLayer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.744Z
 *
 * Overview:
 * A Layer that disables automatic collection of fiber runtime metrics.
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
 *   // Disable runtime metrics collection
 *   const disabledLayer = Metric.disableRuntimeMetricsLayer
 *
 *   return yield* Effect.gen(function*() {
 *     // Check that metrics service is disabled
 *     const metricsService = yield* Metric.FiberRuntimeMetrics
 *     console.log("Metrics enabled:", metricsService !== undefined) // false
 *
 *     // Run some Effects - no metrics will be collected
 *     yield* Effect.forkChild(Effect.sleep("50 millis"))
 *     yield* Effect.forkChild(Effect.sleep("100 millis"))
 *     yield* Effect.sleep("200 millis")
 *
 *     // Create test metrics to show they still work
 *     const testCounter = Metric.counter("test_counter")
 *     yield* Metric.update(testCounter, 1)
 *     const counterValue = yield* Metric.value(testCounter)
 *
 *     return { counterValue, metricsEnabled: metricsService !== undefined }
 *   }).pipe(Effect.provide(disabledLayer))
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
const exportName = "disableRuntimeMetricsLayer";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A Layer that disables automatic collection of fiber runtime metrics.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass MetricsError extends Data.TaggedError("MetricsError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Disable runtime metrics collection\n  const disabledLayer = Metric.disableRuntimeMetricsLayer\n\n  return yield* Effect.gen(function*() {\n    // Check that metrics service is disabled\n    const metricsService = yield* Metric.FiberRuntimeMetrics\n    console.log("Metrics enabled:", metricsService !== undefined) // false\n\n    // Run some Effects - no metrics will be collected\n    yield* Effect.forkChild(Effect.sleep("50 millis"))\n    yield* Effect.forkChild(Effect.sleep("100 millis"))\n    yield* Effect.sleep("200 millis")\n\n    // Create test metrics to show they still work\n    const testCounter = Metric.counter("test_counter")\n    yield* Metric.update(testCounter, 1)\n    const counterValue = yield* Metric.value(testCounter)\n\n    return { counterValue, metricsEnabled: metricsService !== undefined }\n  }).pipe(Effect.provide(disabledLayer))\n})';
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
