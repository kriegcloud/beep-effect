/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: gauge
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.961Z
 *
 * Overview:
 * Represents a `Gauge` metric that tracks and reports a single numerical value at a specific moment.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class GaugeError extends Data.TaggedError("GaugeError")<{
 *   readonly operation: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   // Create a gauge for tracking memory usage
 *   const memoryGauge = Metric.gauge("memory_usage_mb", {
 *     description: "Current memory usage in megabytes"
 *   })
 * 
 *   // Create a gauge for CPU utilization
 *   const cpuGauge = Metric.gauge("cpu_utilization", {
 *     description: "Current CPU utilization percentage",
 *     attributes: { host: "server-01" }
 *   })
 * 
 *   // Create a bigint gauge for large values
 *   const diskSpaceGauge = Metric.gauge("disk_free_bytes", {
 *     description: "Free disk space in bytes",
 *     bigint: true
 *   })
 * 
 *   // Set gauge values (replaces current value)
 *   yield* Metric.update(memoryGauge, 512) // Set to 512 MB
 *   yield* Metric.update(cpuGauge, 85.5) // Set to 85.5%
 *   yield* Metric.update(diskSpaceGauge, 1024000000n) // Set to ~1GB
 * 
 *   // Modify gauge values (adds to current value)
 *   yield* Metric.modify(memoryGauge, 128) // Increase by 128 MB (total: 640)
 *   yield* Metric.modify(cpuGauge, -10.5) // Decrease by 10.5% (total: 75%)
 * 
 *   // Update with new absolute values
 *   yield* Metric.update(memoryGauge, 800) // Set to 800 MB (replaces 640)
 * 
 *   // Get current gauge values
 *   const memoryValue = yield* Metric.value(memoryGauge)
 *   const cpuValue = yield* Metric.value(cpuGauge)
 *   const diskValue = yield* Metric.value(diskSpaceGauge)
 * 
 *   return { memoryValue, cpuValue, diskValue }
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
const exportName = "gauge";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Represents a `Gauge` metric that tracks and reports a single numerical value at a specific moment.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass GaugeError extends Data.TaggedError(\"GaugeError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a gauge for tracking memory usage\n  const memoryGauge = Metric.gauge(\"memory_usage_mb\", {\n    description: \"Current memory usage in megabytes\"\n  })\n\n  // Create a gauge for CPU utilization\n  const cpuGauge = Metric.gauge(\"cpu_utilization\", {\n    description: \"Current CPU utilization percentage\",\n    attributes: { host: \"server-01\" }\n  })\n\n  // Create a bigint gauge for large values\n  const diskSpaceGauge = Metric.gauge(\"disk_free_bytes\", {\n    description: \"Free disk space in bytes\",\n    bigint: true\n  })\n\n  // Set gauge values (replaces current value)\n  yield* Metric.update(memoryGauge, 512) // Set to 512 MB\n  yield* Metric.update(cpuGauge, 85.5) // Set to 85.5%\n  yield* Metric.update(diskSpaceGauge, 1024000000n) // Set to ~1GB\n\n  // Modify gauge values (adds to current value)\n  yield* Metric.modify(memoryGauge, 128) // Increase by 128 MB (total: 640)\n  yield* Metric.modify(cpuGauge, -10.5) // Decrease by 10.5% (total: 75%)\n\n  // Update with new absolute values\n  yield* Metric.update(memoryGauge, 800) // Set to 800 MB (replaces 640)\n\n  // Get current gauge values\n  const memoryValue = yield* Metric.value(memoryGauge)\n  const cpuValue = yield* Metric.value(cpuGauge)\n  const diskValue = yield* Metric.value(diskSpaceGauge)\n\n  return { memoryValue, cpuValue, diskValue }\n})";
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
