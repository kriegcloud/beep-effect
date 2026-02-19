/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: CounterState
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.744Z
 *
 * Overview:
 * State interface for Counter metrics containing the current count and increment mode.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class CounterStateError extends Data.TaggedError("CounterStateError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create different types of counters
 *   const requestCounter = Metric.counter("http_requests_total")
 *   const errorCounter = Metric.counter("errors_total", { incremental: true })
 *   const byteCounter = Metric.counter("bytes_processed", { bigint: true })
 *
 *   // Update counters
 *   yield* Metric.update(requestCounter, 5) // Add 5 requests
 *   yield* Metric.update(requestCounter, -2) // Subtract 2 (allowed for non-incremental)
 *   yield* Metric.update(errorCounter, 3) // Add 3 errors
 *   yield* Metric.update(errorCounter, -1) // Attempt to subtract (ignored for incremental)
 *   yield* Metric.update(byteCounter, 1024000n) // Add bytes as bigint
 *
 *   // Read counter states
 *   const requestState: Metric.CounterState<number> = yield* Metric.value(
 *     requestCounter
 *   )
 *   const errorState: Metric.CounterState<number> = yield* Metric.value(
 *     errorCounter
 *   )
 *   const byteState: Metric.CounterState<bigint> = yield* Metric.value(
 *     byteCounter
 *   )
 *
 *   // CounterState contains:
 *   // - count: current count value (number or bigint based on counter type)
 *   // - incremental: whether counter only allows increases
 *
 *   return {
 *     requests: {
 *       total: requestState.count, // 3 (5 - 2, decrements allowed)
 *       canDecrease: !requestState.incremental // true
 *     },
 *     errors: {
 *       total: errorState.count, // 3 (subtract ignored)
 *       canDecrease: !errorState.incremental // false
 *     },
 *     bytes: {
 *       total: byteState.count, // 1024000n
 *       canDecrease: !byteState.incremental // true
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
const exportName = "CounterState";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "State interface for Counter metrics containing the current count and increment mode.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass CounterStateError extends Data.TaggedError("CounterStateError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create different types of counters\n  const requestCounter = Metric.counter("http_requests_total")\n  const errorCounter = Metric.counter("errors_total", { incremental: true })\n  const byteCounter = Metric.counter("bytes_processed", { bigint: true })\n\n  // Update counters\n  yield* Metric.update(requestCounter, 5) // Add 5 requests\n  yield* Metric.update(requestCounter, -2) // Subtract 2 (allowed for non-incremental)\n  yield* Metric.update(errorCounter, 3) // Add 3 errors\n  yield* Metric.update(errorCounter, -1) // Attempt to subtract (ignored for incremental)\n  yield* Metric.update(byteCounter, 1024000n) // Add bytes as bigint\n\n  // Read counter states\n  const requestState: Metric.CounterState<number> = yield* Metric.value(\n    requestCounter\n  )\n  const errorState: Metric.CounterState<number> = yield* Metric.value(\n    errorCounter\n  )\n  const byteState: Metric.CounterState<bigint> = yield* Metric.value(\n    byteCounter\n  )\n\n  // CounterState contains:\n  // - count: current count value (number or bigint based on counter type)\n  // - incremental: whether counter only allows increases\n\n  return {\n    requests: {\n      total: requestState.count, // 3 (5 - 2, decrements allowed)\n      canDecrease: !requestState.incremental // true\n    },\n    errors: {\n      total: errorState.count, // 3 (subtract ignored)\n      canDecrease: !errorState.incremental // false\n    },\n    bytes: {\n      total: byteState.count, // 1024000n\n      canDecrease: !byteState.incremental // true\n    }\n  }\n})';
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
