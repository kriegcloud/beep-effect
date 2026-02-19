/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: snapshot
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.746Z
 *
 * Overview:
 * Captures a snapshot of all registered metrics in the current context.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Data, Effect, Metric } from "effect"
 *
 * class SnapshotError extends Data.TaggedError("SnapshotError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create and update some metrics
 *   const requestCounter = Metric.counter("http_requests", {
 *     description: "Total HTTP requests"
 *   })
 *   const responseTime = Metric.histogram("response_time_ms", {
 *     description: "Response time in milliseconds",
 *     boundaries: Metric.linearBoundaries({ start: 0, width: 100, count: 5 })
 *   })
 *
 *   // Update the metrics with some values
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(responseTime, 150)
 *   yield* Metric.update(responseTime, 75)
 *
 *   // Take a snapshot of all metrics
 *   const snapshots = yield* Metric.snapshot
 *
 *   // Examine the snapshots
 *   for (const snapshot of snapshots) {
 *     yield* Console.log(`Metric: ${snapshot.id}`)
 *     yield* Console.log(`Description: ${snapshot.description}`)
 *     yield* Console.log(`Type: ${snapshot.type}`)
 *     yield* Console.log(`State:`, snapshot.state)
 *   }
 *
 *   return snapshots
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
const exportName = "snapshot";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Captures a snapshot of all registered metrics in the current context.";
const sourceExample =
  'import { Console, Data, Effect, Metric } from "effect"\n\nclass SnapshotError extends Data.TaggedError("SnapshotError")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create and update some metrics\n  const requestCounter = Metric.counter("http_requests", {\n    description: "Total HTTP requests"\n  })\n  const responseTime = Metric.histogram("response_time_ms", {\n    description: "Response time in milliseconds",\n    boundaries: Metric.linearBoundaries({ start: 0, width: 100, count: 5 })\n  })\n\n  // Update the metrics with some values\n  yield* Metric.update(requestCounter, 1)\n  yield* Metric.update(requestCounter, 1)\n  yield* Metric.update(responseTime, 150)\n  yield* Metric.update(responseTime, 75)\n\n  // Take a snapshot of all metrics\n  const snapshots = yield* Metric.snapshot\n\n  // Examine the snapshots\n  for (const snapshot of snapshots) {\n    yield* Console.log(`Metric: ${snapshot.id}`)\n    yield* Console.log(`Description: ${snapshot.description}`)\n    yield* Console.log(`Type: ${snapshot.type}`)\n    yield* Console.log(`State:`, snapshot.state)\n  }\n\n  return snapshots\n})';
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
