/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: FiberRuntimeMetricsImpl
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * Default implementation of the fiber runtime metrics service.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Layer, Metric } from "effect"
 *
 * class MetricsError extends Data.TaggedError("MetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Use the default metrics implementation
 *   const metrics = Metric.FiberRuntimeMetricsImpl
 *   console.log("Metrics implementation:", metrics)
 *
 *   // Enable runtime metrics using the default implementation
 *   const layer = Layer.succeed(Metric.FiberRuntimeMetrics)(metrics)
 *
 *   return yield* Effect.gen(function*() {
 *     // Run some Effects to trigger metric collection
 *     yield* Effect.forkChild(Effect.sleep("50 millis"))
 *     yield* Effect.forkChild(Effect.sleep("100 millis"))
 *
 *     // Wait a bit and check the metrics
 *     yield* Effect.sleep("200 millis")
 *
 *     // Create test metrics to demonstrate the implementation
 *     const testCounter = Metric.counter("test_counter")
 *     const testGauge = Metric.gauge("test_gauge")
 *     yield* Metric.update(testCounter, 3)
 *     yield* Metric.update(testGauge, 42)
 *
 *     const counterValue = yield* Metric.value(testCounter)
 *     const gaugeValue = yield* Metric.value(testGauge)
 *
 *     return { counter: counterValue, gauge: gaugeValue }
 *   }).pipe(Effect.provide(layer))
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
const exportName = "FiberRuntimeMetricsImpl";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Default implementation of the fiber runtime metrics service.";
const sourceExample =
  'import { Data, Effect, Layer, Metric } from "effect"\n\nclass MetricsError extends Data.TaggedError("MetricsError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Use the default metrics implementation\n  const metrics = Metric.FiberRuntimeMetricsImpl\n  console.log("Metrics implementation:", metrics)\n\n  // Enable runtime metrics using the default implementation\n  const layer = Layer.succeed(Metric.FiberRuntimeMetrics)(metrics)\n\n  return yield* Effect.gen(function*() {\n    // Run some Effects to trigger metric collection\n    yield* Effect.forkChild(Effect.sleep("50 millis"))\n    yield* Effect.forkChild(Effect.sleep("100 millis"))\n\n    // Wait a bit and check the metrics\n    yield* Effect.sleep("200 millis")\n\n    // Create test metrics to demonstrate the implementation\n    const testCounter = Metric.counter("test_counter")\n    const testGauge = Metric.gauge("test_gauge")\n    yield* Metric.update(testCounter, 3)\n    yield* Metric.update(testGauge, 42)\n\n    const counterValue = yield* Metric.value(testCounter)\n    const gaugeValue = yield* Metric.value(testGauge)\n\n    return { counter: counterValue, gauge: gaugeValue }\n  }).pipe(Effect.provide(layer))\n})';
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
