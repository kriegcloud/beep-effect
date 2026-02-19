/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: value
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.962Z
 *
 * Overview:
 * Retrieves the current state of the specified `Metric`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Metric } from "effect"
 * 
 * const requestCounter = Metric.counter("requests")
 * const responseTime = Metric.histogram("response_time", {
 *   boundaries: [100, 500, 1000, 2000]
 * })
 * 
 * const program = Effect.gen(function*() {
 *   // Update metrics
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(responseTime, 750)
 * 
 *   // Get current values
 *   const counterState = yield* Metric.value(requestCounter)
 *   console.log(`Request count: ${counterState.count}`)
 * 
 *   const histogramState = yield* Metric.value(responseTime)
 *   console.log(`Response time stats:`, {
 *     count: histogramState.count,
 *     min: histogramState.min,
 *     max: histogramState.max,
 *     average: histogramState.sum / histogramState.count
 *   })
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
const exportName = "value";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Retrieves the current state of the specified `Metric`.";
const sourceExample = "import { Effect, Metric } from \"effect\"\n\nconst requestCounter = Metric.counter(\"requests\")\nconst responseTime = Metric.histogram(\"response_time\", {\n  boundaries: [100, 500, 1000, 2000]\n})\n\nconst program = Effect.gen(function*() {\n  // Update metrics\n  yield* Metric.update(requestCounter, 1)\n  yield* Metric.update(responseTime, 750)\n\n  // Get current values\n  const counterState = yield* Metric.value(requestCounter)\n  console.log(`Request count: ${counterState.count}`)\n\n  const histogramState = yield* Metric.value(responseTime)\n  console.log(`Response time stats:`, {\n    count: histogramState.count,\n    min: histogramState.min,\n    max: histogramState.max,\n    average: histogramState.sum / histogramState.count\n  })\n})";
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
