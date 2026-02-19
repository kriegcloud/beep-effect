/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: boundariesFromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.744Z
 *
 * Overview:
 * A helper method to create histogram bucket boundaries from an iterable set of values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class BoundaryError extends Data.TaggedError("BoundaryError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create boundaries from an array of custom values
 * const customBoundaries = Metric.boundariesFromIterable([
 *   10,
 *   25,
 *   50,
 *   100,
 *   250,
 *   500,
 *   1000
 * ])
 * console.log(customBoundaries) // [10, 25, 50, 100, 250, 500, 1000, Infinity]
 *
 * // Automatically removes duplicates and negative values
 * const messyBoundaries = Metric.boundariesFromIterable([
 *   -5,
 *   0,
 *   10,
 *   10,
 *   25,
 *   25,
 *   50,
 *   -1
 * ])
 * console.log(messyBoundaries) // [10, 25, 50, Infinity]
 *
 * // Works with any iterable (Set, generator functions, etc.)
 * const setBoundaries = Metric.boundariesFromIterable(
 *   new Set([100, 200, 300, 200, 100])
 * )
 * console.log(setBoundaries) // [100, 200, 300, Infinity]
 *
 * // Use with histogram metric
 * const responseTimeHistogram = Metric.histogram("response_times", {
 *   description: "API response time distribution",
 *   boundaries: customBoundaries
 * })
 *
 * const program = Effect.gen(function*() {
 *   yield* Metric.update(responseTimeHistogram, 75) // Goes in 50-100ms bucket
 *   yield* Metric.update(responseTimeHistogram, 150) // Goes in 100-250ms bucket
 *
 *   const value = yield* Metric.value(responseTimeHistogram)
 *   return value
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "boundariesFromIterable";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "A helper method to create histogram bucket boundaries from an iterable set of values.";
const sourceExample =
  'import { Data, Effect, Metric } from "effect"\n\nclass BoundaryError extends Data.TaggedError("BoundaryError")<{\n  readonly operation: string\n}> {}\n\n// Create boundaries from an array of custom values\nconst customBoundaries = Metric.boundariesFromIterable([\n  10,\n  25,\n  50,\n  100,\n  250,\n  500,\n  1000\n])\nconsole.log(customBoundaries) // [10, 25, 50, 100, 250, 500, 1000, Infinity]\n\n// Automatically removes duplicates and negative values\nconst messyBoundaries = Metric.boundariesFromIterable([\n  -5,\n  0,\n  10,\n  10,\n  25,\n  25,\n  50,\n  -1\n])\nconsole.log(messyBoundaries) // [10, 25, 50, Infinity]\n\n// Works with any iterable (Set, generator functions, etc.)\nconst setBoundaries = Metric.boundariesFromIterable(\n  new Set([100, 200, 300, 200, 100])\n)\nconsole.log(setBoundaries) // [100, 200, 300, Infinity]\n\n// Use with histogram metric\nconst responseTimeHistogram = Metric.histogram("response_times", {\n  description: "API response time distribution",\n  boundaries: customBoundaries\n})\n\nconst program = Effect.gen(function*() {\n  yield* Metric.update(responseTimeHistogram, 75) // Goes in 50-100ms bucket\n  yield* Metric.update(responseTimeHistogram, 150) // Goes in 100-250ms bucket\n\n  const value = yield* Metric.value(responseTimeHistogram)\n  return value\n})';
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
