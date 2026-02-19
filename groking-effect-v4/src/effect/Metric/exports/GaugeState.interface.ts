/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: GaugeState
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.745Z
 *
 * Overview:
 * State interface for Gauge metrics containing the current instantaneous value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class GaugeStateError extends Data.TaggedError("GaugeStateError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create different types of gauges
 *   const temperatureGauge = Metric.gauge("room_temperature_celsius", {
 *     description: "Current room temperature"
 *   })
 *
 *   const diskSpaceGauge = Metric.gauge("disk_usage_bytes", {
 *     description: "Current disk usage",
 *     bigint: true
 *   })
 *
 *   const queueSizeGauge = Metric.gauge("queue_size", {
 *     description: "Current queue size"
 *   })
 *
 *   // Set gauge values (absolute values)
 *   yield* Metric.update(temperatureGauge, 22.5) // Set to 22.5°C
 *   yield* Metric.update(diskSpaceGauge, 5000000000n) // Set to 5GB usage
 *   yield* Metric.update(queueSizeGauge, 10) // Set to 10 items
 *
 *   // Update gauge values (new absolute values)
 *   yield* Metric.update(temperatureGauge, 23.1) // Temperature changed
 *   yield* Metric.update(queueSizeGauge, 15) // Queue grew
 *
 *   // Read gauge states
 *   const tempState: Metric.GaugeState<number> = yield* Metric.value(
 *     temperatureGauge
 *   )
 *   const diskState: Metric.GaugeState<bigint> = yield* Metric.value(
 *     diskSpaceGauge
 *   )
 *   const queueState: Metric.GaugeState<number> = yield* Metric.value(
 *     queueSizeGauge
 *   )
 *
 *   // GaugeState contains:
 *   // - value: current instantaneous value (number or bigint based on gauge type)
 *
 *   return {
 *     environment: {
 *       temperature: tempState.value, // 23.1
 *       temperatureUnit: "°C"
 *     },
 *     system: {
 *       diskUsage: diskState.value, // 5000000000n
 *       diskUsageGB: Number(diskState.value) / 1_000_000_000, // 5
 *       queueSize: queueState.value // 15
 *     }
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
const exportName = "GaugeState";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "State interface for Gauge metrics containing the current instantaneous value.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass GaugeStateError extends Data.TaggedError("GaugeStateError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create different types of gauges\n  const temperatureGauge = Metric.gauge("room_temperature_celsius", {\n    description: "Current room temperature"\n  })\n\n  const diskSpaceGauge = Metric.gauge("disk_usage_bytes", {\n    description: "Current disk usage",\n    bigint: true\n  })\n\n  const queueSizeGauge = Metric.gauge("queue_size", {\n    description: "Current queue size"\n  })\n\n  // Set gauge values (absolute values)\n  yield* Metric.update(temperatureGauge, 22.5) // Set to 22.5°C\n  yield* Metric.update(diskSpaceGauge, 5000000000n) // Set to 5GB usage\n  yield* Metric.update(queueSizeGauge, 10) // Set to 10 items\n\n  // Update gauge values (new absolute values)\n  yield* Metric.update(temperatureGauge, 23.1) // Temperature changed\n  yield* Metric.update(queueSizeGauge, 15) // Queue grew\n\n  // Read gauge states\n  const tempState: Metric.GaugeState<number> = yield* Metric.value(\n    temperatureGauge\n  )\n  const diskState: Metric.GaugeState<bigint> = yield* Metric.value(\n    diskSpaceGauge\n  )\n  const queueState: Metric.GaugeState<number> = yield* Metric.value(\n    queueSizeGauge\n  )\n\n  // GaugeState contains:\n  // - value: current instantaneous value (number or bigint based on gauge type)\n\n  return {\n    environment: {\n      temperature: tempState.value, // 23.1\n      temperatureUnit: "°C"\n    },\n    system: {\n      diskUsage: diskState.value, // 5000000000n\n      diskUsageGB: Number(diskState.value) / 1_000_000_000, // 5\n      queueSize: queueState.value // 15\n    }\n  }\n})';
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
