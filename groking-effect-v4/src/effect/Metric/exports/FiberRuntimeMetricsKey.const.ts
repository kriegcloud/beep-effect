/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: FiberRuntimeMetricsKey
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * Service key for the fiber runtime metrics service.
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
 *   // The key is used internally by the Effect runtime to manage fiber metrics
 *   const key = Metric.FiberRuntimeMetricsKey
 *   console.log("Fiber metrics key:", key)
 * 
 *   // Enable runtime metrics using the key
 *   const layer = Layer.succeed(Metric.FiberRuntimeMetrics)(
 *     Metric.FiberRuntimeMetricsImpl
 *   )
 * 
 *   return yield* Effect.gen(function*() {
 *     // This Effect will have fiber metrics automatically collected
 *     yield* Effect.sleep("100 millis")
 * 
 *     // Create a test counter to demonstrate the key usage
 *     const testCounter = Metric.counter("test_counter")
 *     yield* Metric.update(testCounter, 1)
 *     return yield* Metric.value(testCounter)
 *   }).pipe(Effect.provide(layer))
 * })
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
const exportName = "FiberRuntimeMetricsKey";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Service key for the fiber runtime metrics service.";
const sourceExample = "import { Data, Effect, Layer, Metric } from \"effect\"\n\nclass MetricsError extends Data.TaggedError(\"MetricsError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // The key is used internally by the Effect runtime to manage fiber metrics\n  const key = Metric.FiberRuntimeMetricsKey\n  console.log(\"Fiber metrics key:\", key)\n\n  // Enable runtime metrics using the key\n  const layer = Layer.succeed(Metric.FiberRuntimeMetrics)(\n    Metric.FiberRuntimeMetricsImpl\n  )\n\n  return yield* Effect.gen(function*() {\n    // This Effect will have fiber metrics automatically collected\n    yield* Effect.sleep(\"100 millis\")\n\n    // Create a test counter to demonstrate the key usage\n    const testCounter = Metric.counter(\"test_counter\")\n    yield* Metric.update(testCounter, 1)\n    return yield* Metric.value(testCounter)\n  }).pipe(Effect.provide(layer))\n})";
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
