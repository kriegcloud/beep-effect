/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: timer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.962Z
 *
 * Overview:
 * Creates a timer metric, based on a `Histogram`, which keeps track of durations in milliseconds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Duration, Effect, Metric } from "effect"
 *
 * class TimerError extends Data.TaggedError("TimerError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a timer metric to track API request durations
 * const apiRequestTimer = Metric.timer("api_request_duration", {
 *   description: "Duration of API requests",
 *   attributes: { service: "user-api" }
 * })
 *
 * // Simulate an API operation and measure its duration
 * const apiOperation = Effect.gen(function*() {
 *   const start = Date.now()
 *   yield* Effect.sleep(Duration.millis(100)) // Simulate work
 *   const duration = Duration.millis(Date.now() - start)
 *
 *   // Update the timer with the measured duration
 *   yield* Metric.update(apiRequestTimer, duration)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "timer";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Creates a timer metric, based on a `Histogram`, which keeps track of durations in milliseconds.";
const sourceExample =
  'import { Data, Duration, Effect, Metric } from "effect"\n\nclass TimerError extends Data.TaggedError("TimerError")<{\n  readonly operation: string\n}> {}\n\n// Create a timer metric to track API request durations\nconst apiRequestTimer = Metric.timer("api_request_duration", {\n  description: "Duration of API requests",\n  attributes: { service: "user-api" }\n})\n\n// Simulate an API operation and measure its duration\nconst apiOperation = Effect.gen(function*() {\n  const start = Date.now()\n  yield* Effect.sleep(Duration.millis(100)) // Simulate work\n  const duration = Duration.millis(Date.now() - start)\n\n  // Update the timer with the measured duration\n  yield* Metric.update(apiRequestTimer, duration)\n})';
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
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
