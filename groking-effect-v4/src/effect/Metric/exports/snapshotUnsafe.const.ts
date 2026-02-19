/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: snapshotUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.962Z
 *
 * Overview:
 * Synchronously captures a snapshot of all registered metrics using the provided service context.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class UnsafeSnapshotError extends Data.TaggedError("UnsafeSnapshotError")<{
 *   readonly operation: string
 * }> {}
 * 
 * // Use unsafeSnapshot in performance-critical scenarios or internal implementations
 * const performanceMetricsExporter = Effect.gen(function*() {
 *   // Create some metrics first
 *   const requestCounter = Metric.counter("http_requests", {
 *     description: "Total HTTP requests"
 *   })
 *   const responseTime = Metric.gauge("response_time_ms", {
 *     description: "Current response time"
 *   })
 * 
 *   // Update metrics
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(responseTime, 150)
 * 
 *   // Get services context for unsafe operations
 *   const services = yield* Effect.services()
 * 
 *   // Use snapshotUnsafe for direct, synchronous access
 *   const snapshots = Metric.snapshotUnsafe(services)
 * 
 *   // Process snapshots immediately (useful for exporters, debugging tools)
 *   const exportData = snapshots.map((snapshot) => ({
 *     name: snapshot.id,
 *     type: snapshot.type,
 *     value: snapshot.state,
 *     timestamp: Date.now()
 *   }))
 * 
 *   // This is synchronous and doesn't involve Effect overhead
 *   // Useful for performance-critical metric export operations
 *   return exportData
 * })
 * 
 * // For normal application use, prefer the safe snapshot function:
 * const safeSnapshotExample = Effect.gen(function*() {
 *   // This automatically handles the services context
 *   const snapshots = yield* Metric.snapshot
 *   return snapshots
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
const exportName = "snapshotUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Synchronously captures a snapshot of all registered metrics using the provided service context.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass UnsafeSnapshotError extends Data.TaggedError(\"UnsafeSnapshotError\")<{\n  readonly operation: string\n}> {}\n\n// Use unsafeSnapshot in performance-critical scenarios or internal implementations\nconst performanceMetricsExporter = Effect.gen(function*() {\n  // Create some metrics first\n  const requestCounter = Metric.counter(\"http_requests\", {\n    description: \"Total HTTP requests\"\n  })\n  const responseTime = Metric.gauge(\"response_time_ms\", {\n    description: \"Current response time\"\n  })\n\n  // Update metrics\n  yield* Metric.update(requestCounter, 1)\n  yield* Metric.update(responseTime, 150)\n\n  // Get services context for unsafe operations\n  const services = yield* Effect.services()\n\n  // Use snapshotUnsafe for direct, synchronous access\n  const snapshots = Metric.snapshotUnsafe(services)\n\n  // Process snapshots immediately (useful for exporters, debugging tools)\n  const exportData = snapshots.map((snapshot) => ({\n    name: snapshot.id,\n    type: snapshot.type,\n    value: snapshot.state,\n    timestamp: Date.now()\n  }))\n\n  // This is synchronous and doesn't involve Effect overhead\n  // Useful for performance-critical metric export operations\n  return exportData\n})\n\n// For normal application use, prefer the safe snapshot function:\nconst safeSnapshotExample = Effect.gen(function*() {\n  // This automatically handles the services context\n  const snapshots = yield* Metric.snapshot\n  return snapshots\n})";
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
