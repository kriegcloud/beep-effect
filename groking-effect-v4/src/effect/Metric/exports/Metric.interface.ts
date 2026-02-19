/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: Metric
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.746Z
 *
 * Overview:
 * A `Metric<Input, State>` represents a concurrent metric which accepts update values of type `Input` and are aggregated to a value of type `State`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class MetricExample extends Data.TaggedError("MetricExample")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create different types of metrics
 *   const requestCounter: Metric.Counter<number> = Metric.counter("requests", {
 *     description: "Total requests processed"
 *   })
 *
 *   const memoryGauge: Metric.Gauge<number> = Metric.gauge("memory_usage", {
 *     description: "Current memory usage in MB"
 *   })
 *
 *   const statusFrequency: Metric.Frequency = Metric.frequency("status_codes", {
 *     description: "HTTP status code frequency"
 *   })
 *
 *   // All metrics share the same interface for updates and reads
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(memoryGauge, 128)
 *   yield* Metric.update(statusFrequency, "200")
 *
 *   // All metrics can be read with Metric.value
 *   const counterState = yield* Metric.value(requestCounter)
 *   const gaugeState = yield* Metric.value(memoryGauge)
 *   const frequencyState = yield* Metric.value(statusFrequency)
 *
 *   // Metrics have common properties accessible through the interface:
 *   // - id: unique identifier
 *   // - type: metric type ("Counter", "Gauge", "Frequency", etc.)
 *   // - description: optional human-readable description
 *   // - attributes: optional key-value attributes for tagging
 *
 *   return {
 *     counter: {
 *       id: requestCounter.id,
 *       type: requestCounter.type,
 *       state: counterState
 *     },
 *     gauge: { id: memoryGauge.id, type: memoryGauge.type, state: gaugeState },
 *     frequency: {
 *       id: statusFrequency.id,
 *       type: statusFrequency.type,
 *       state: frequencyState
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
const exportName = "Metric";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary =
  "A `Metric<Input, State>` represents a concurrent metric which accepts update values of type `Input` and are aggregated to a value of type `State`.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass MetricExample extends Data.TaggedError("MetricExample")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create different types of metrics\n  const requestCounter: Metric.Counter<number> = Metric.counter("requests", {\n    description: "Total requests processed"\n  })\n\n  const memoryGauge: Metric.Gauge<number> = Metric.gauge("memory_usage", {\n    description: "Current memory usage in MB"\n  })\n\n  const statusFrequency: Metric.Frequency = Metric.frequency("status_codes", {\n    description: "HTTP status code frequency"\n  })\n\n  // All metrics share the same interface for updates and reads\n  yield* Metric.update(requestCounter, 1)\n  yield* Metric.update(memoryGauge, 128)\n  yield* Metric.update(statusFrequency, "200")\n\n  // All metrics can be read with Metric.value\n  const counterState = yield* Metric.value(requestCounter)\n  const gaugeState = yield* Metric.value(memoryGauge)\n  const frequencyState = yield* Metric.value(statusFrequency)\n\n  // Metrics have common properties accessible through the interface:\n  // - id: unique identifier\n  // - type: metric type ("Counter", "Gauge", "Frequency", etc.)\n  // - description: optional human-readable description\n  // - attributes: optional key-value attributes for tagging\n\n  return {\n    counter: {\n      id: requestCounter.id,\n      type: requestCounter.type,\n      state: counterState\n    },\n    gauge: { id: memoryGauge.id, type: memoryGauge.type, state: gaugeState },\n    frequency: {\n      id: statusFrequency.id,\n      type: statusFrequency.type,\n      state: frequencyState\n    }\n  }\n})';
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
