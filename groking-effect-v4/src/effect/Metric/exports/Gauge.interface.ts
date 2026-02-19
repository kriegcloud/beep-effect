/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: Gauge
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.745Z
 *
 * Overview:
 * A Gauge metric that tracks instantaneous values that can go up or down.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class GaugeInterfaceError extends Data.TaggedError("GaugeInterfaceError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create different types of gauges
 *   const memoryGauge: Metric.Gauge<number> = Metric.gauge("memory_usage_mb", {
 *     description: "Current memory usage in megabytes"
 *   })
 *
 *   const diskSpaceGauge: Metric.Gauge<bigint> = Metric.gauge("disk_free_bytes", {
 *     description: "Available disk space in bytes",
 *     bigint: true,
 *     attributes: { mount: "/var" }
 *   })
 *
 *   // Set gauge values (absolute values)
 *   yield* Metric.update(memoryGauge, 512) // Set to 512 MB
 *   yield* Metric.update(memoryGauge, 640) // Set to 640 MB (replaces 512)
 *   yield* Metric.update(diskSpaceGauge, 5000000000n) // Set to ~5GB free
 *
 *   // Modify gauge values (relative changes)
 *   yield* Metric.modify(memoryGauge, 128) // Add 128 MB (total: 768)
 *   yield* Metric.modify(memoryGauge, -64) // Subtract 64 MB (total: 704)
 *
 *   // Read gauge state
 *   const memoryState: Metric.GaugeState<number> = yield* Metric.value(
 *     memoryGauge
 *   )
 *   const diskState: Metric.GaugeState<bigint> = yield* Metric.value(
 *     diskSpaceGauge
 *   )
 *
 *   // Gauge state contains:
 *   // - value: current instantaneous value
 *
 *   return {
 *     memory: { currentValue: memoryState.value }, // 704
 *     disk: { currentValue: diskState.value } // 5000000000n
 *   }
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Gauge";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A Gauge metric that tracks instantaneous values that can go up or down.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass GaugeInterfaceError extends Data.TaggedError("GaugeInterfaceError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create different types of gauges\n  const memoryGauge: Metric.Gauge<number> = Metric.gauge("memory_usage_mb", {\n    description: "Current memory usage in megabytes"\n  })\n\n  const diskSpaceGauge: Metric.Gauge<bigint> = Metric.gauge("disk_free_bytes", {\n    description: "Available disk space in bytes",\n    bigint: true,\n    attributes: { mount: "/var" }\n  })\n\n  // Set gauge values (absolute values)\n  yield* Metric.update(memoryGauge, 512) // Set to 512 MB\n  yield* Metric.update(memoryGauge, 640) // Set to 640 MB (replaces 512)\n  yield* Metric.update(diskSpaceGauge, 5000000000n) // Set to ~5GB free\n\n  // Modify gauge values (relative changes)\n  yield* Metric.modify(memoryGauge, 128) // Add 128 MB (total: 768)\n  yield* Metric.modify(memoryGauge, -64) // Subtract 64 MB (total: 704)\n\n  // Read gauge state\n  const memoryState: Metric.GaugeState<number> = yield* Metric.value(\n    memoryGauge\n  )\n  const diskState: Metric.GaugeState<bigint> = yield* Metric.value(\n    diskSpaceGauge\n  )\n\n  // Gauge state contains:\n  // - value: current instantaneous value\n\n  return {\n    memory: { currentValue: memoryState.value }, // 704\n    disk: { currentValue: diskState.value } // 5000000000n\n  }\n})';
const moduleRecord = MetricModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
