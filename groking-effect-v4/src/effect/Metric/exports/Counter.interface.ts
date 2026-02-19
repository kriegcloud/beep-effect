/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: Counter
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * A Counter metric that tracks cumulative values that typically only increase.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class CounterInterfaceError extends Data.TaggedError("CounterInterfaceError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create different types of counters
 *   const requestCounter: Metric.Counter<number> = Metric.counter(
 *     "http_requests",
 *     {
 *       description: "Total HTTP requests processed",
 *       incremental: true // Only allows increments
 *     }
 *   )
 *
 *   const bytesCounter: Metric.Counter<bigint> = Metric.counter(
 *     "bytes_processed",
 *     {
 *       description: "Total bytes processed",
 *       bigint: true,
 *       attributes: { service: "data-processor" }
 *     }
 *   )
 *
 *   // Update counters
 *   yield* Metric.update(requestCounter, 1) // Increment by 1
 *   yield* Metric.update(requestCounter, 5) // Increment by 5 (total: 6)
 *   yield* Metric.update(bytesCounter, 1024n) // Add 1024 bytes
 *
 *   // Read counter state
 *   const requestState: Metric.CounterState<number> = yield* Metric.value(
 *     requestCounter
 *   )
 *   const bytesState: Metric.CounterState<bigint> = yield* Metric.value(
 *     bytesCounter
 *   )
 *
 *   // Counter state contains:
 *   // - count: current accumulated value
 *   // - incremental: whether only increments are allowed
 *
 *   return {
 *     requests: {
 *       count: requestState.count,
 *       incremental: requestState.incremental
 *     },
 *     bytes: { count: bytesState.count, incremental: bytesState.incremental }
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Counter";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A Counter metric that tracks cumulative values that typically only increase.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass CounterInterfaceError extends Data.TaggedError("CounterInterfaceError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create different types of counters\n  const requestCounter: Metric.Counter<number> = Metric.counter(\n    "http_requests",\n    {\n      description: "Total HTTP requests processed",\n      incremental: true // Only allows increments\n    }\n  )\n\n  const bytesCounter: Metric.Counter<bigint> = Metric.counter(\n    "bytes_processed",\n    {\n      description: "Total bytes processed",\n      bigint: true,\n      attributes: { service: "data-processor" }\n    }\n  )\n\n  // Update counters\n  yield* Metric.update(requestCounter, 1) // Increment by 1\n  yield* Metric.update(requestCounter, 5) // Increment by 5 (total: 6)\n  yield* Metric.update(bytesCounter, 1024n) // Add 1024 bytes\n\n  // Read counter state\n  const requestState: Metric.CounterState<number> = yield* Metric.value(\n    requestCounter\n  )\n  const bytesState: Metric.CounterState<bigint> = yield* Metric.value(\n    bytesCounter\n  )\n\n  // Counter state contains:\n  // - count: current accumulated value\n  // - incremental: whether only increments are allowed\n\n  return {\n    requests: {\n      count: requestState.count,\n      incremental: requestState.incremental\n    },\n    bytes: { count: bytesState.count, incremental: bytesState.incremental }\n  }\n})';
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
  bunContext: BunContext,
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
