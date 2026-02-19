/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: update
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.962Z
 *
 * Overview:
 * Updates the metric with the specified input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Metric } from "effect"
 * 
 * const cpuUsage = Metric.gauge("cpu_usage_percent")
 * const httpStatus = Metric.frequency("http_status_codes")
 * const responseTime = Metric.histogram("response_time_ms", {
 *   boundaries: [100, 500, 1000, 2000]
 * })
 * 
 * const program = Effect.gen(function*() {
 *   // Update gauge to specific values
 *   yield* Metric.update(cpuUsage, 45.2)
 *   yield* Metric.update(cpuUsage, 67.8) // Replaces previous value
 * 
 *   // Track HTTP status code occurrences
 *   yield* Metric.update(httpStatus, "200")
 *   yield* Metric.update(httpStatus, "404")
 *   yield* Metric.update(httpStatus, "200") // Increments 200 count
 * 
 *   // Record response times
 *   yield* Metric.update(responseTime, 250)
 *   yield* Metric.update(responseTime, 750)
 *   yield* Metric.update(responseTime, 1500)
 * 
 *   // Check current states
 *   const cpu = yield* Metric.value(cpuUsage)
 *   const statuses = yield* Metric.value(httpStatus)
 *   const times = yield* Metric.value(responseTime)
 * 
 *   console.log(`CPU Usage: ${cpu.value}%`)
 *   console.log(`Status 200 count: ${statuses.occurrences.get("200")}`) // 2
 *   console.log(`Response time samples: ${times.count}`) // 3
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
const exportName = "update";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Updates the metric with the specified input.";
const sourceExample = "import { Effect, Metric } from \"effect\"\n\nconst cpuUsage = Metric.gauge(\"cpu_usage_percent\")\nconst httpStatus = Metric.frequency(\"http_status_codes\")\nconst responseTime = Metric.histogram(\"response_time_ms\", {\n  boundaries: [100, 500, 1000, 2000]\n})\n\nconst program = Effect.gen(function*() {\n  // Update gauge to specific values\n  yield* Metric.update(cpuUsage, 45.2)\n  yield* Metric.update(cpuUsage, 67.8) // Replaces previous value\n\n  // Track HTTP status code occurrences\n  yield* Metric.update(httpStatus, \"200\")\n  yield* Metric.update(httpStatus, \"404\")\n  yield* Metric.update(httpStatus, \"200\") // Increments 200 count\n\n  // Record response times\n  yield* Metric.update(responseTime, 250)\n  yield* Metric.update(responseTime, 750)\n  yield* Metric.update(responseTime, 1500)\n\n  // Check current states\n  const cpu = yield* Metric.value(cpuUsage)\n  const statuses = yield* Metric.value(httpStatus)\n  const times = yield* Metric.value(responseTime)\n\n  console.log(`CPU Usage: ${cpu.value}%`)\n  console.log(`Status 200 count: ${statuses.occurrences.get(\"200\")}`) // 2\n  console.log(`Response time samples: ${times.count}`) // 3\n})";
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
