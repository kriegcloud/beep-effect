/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.961Z
 *
 * Overview:
 * Modifies the metric with the specified input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Metric } from "effect"
 * 
 * const temperatureGauge = Metric.gauge("temperature")
 * const requestCounter = Metric.counter("requests")
 * 
 * const program = Effect.gen(function*() {
 *   // Set initial temperature
 *   yield* Metric.update(temperatureGauge, 20)
 * 
 *   // Modify by adding/subtracting values
 *   yield* Metric.modify(temperatureGauge, 5) // Now 25
 *   yield* Metric.modify(temperatureGauge, -3) // Now 22
 * 
 *   // For counters, modify increments by the specified amount
 *   yield* Metric.modify(requestCounter, 10) // Add 10 to counter
 *   yield* Metric.modify(requestCounter, 5) // Add 5 more (total: 15)
 * 
 *   const temp = yield* Metric.value(temperatureGauge)
 *   const requests = yield* Metric.value(requestCounter)
 * 
 *   console.log(`Temperature: ${temp.value}°C`) // 22°C
 *   console.log(`Requests: ${requests.count}`) // 15
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
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Modifies the metric with the specified input.";
const sourceExample = "import { Effect, Metric } from \"effect\"\n\nconst temperatureGauge = Metric.gauge(\"temperature\")\nconst requestCounter = Metric.counter(\"requests\")\n\nconst program = Effect.gen(function*() {\n  // Set initial temperature\n  yield* Metric.update(temperatureGauge, 20)\n\n  // Modify by adding/subtracting values\n  yield* Metric.modify(temperatureGauge, 5) // Now 25\n  yield* Metric.modify(temperatureGauge, -3) // Now 22\n\n  // For counters, modify increments by the specified amount\n  yield* Metric.modify(requestCounter, 10) // Add 10 to counter\n  yield* Metric.modify(requestCounter, 5) // Add 5 more (total: 15)\n\n  const temp = yield* Metric.value(temperatureGauge)\n  const requests = yield* Metric.value(requestCounter)\n\n  console.log(`Temperature: ${temp.value}°C`) // 22°C\n  console.log(`Requests: ${requests.count}`) // 15\n})";
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
