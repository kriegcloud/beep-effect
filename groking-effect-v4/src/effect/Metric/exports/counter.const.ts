/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: counter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * Represents a Counter metric that tracks cumulative numerical values over time. Counters can be incremented and decremented and provide a running total of changes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 * 
 * class CounterError extends Data.TaggedError("CounterError")<{
 *   readonly operation: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   // Create a basic counter for tracking requests
 *   const requestCounter = Metric.counter("http_requests_total", {
 *     description: "Total number of HTTP requests processed"
 *   })
 * 
 *   // Create an incremental-only counter for events
 *   const eventCounter = Metric.counter("events_processed", {
 *     description: "Events processed (increment only)",
 *     incremental: true
 *   })
 * 
 *   // Create a bigint counter for large values
 *   const bytesCounter = Metric.counter("bytes_transferred", {
 *     description: "Total bytes transferred",
 *     bigint: true,
 *     attributes: { service: "file-transfer" }
 *   })
 * 
 *   // Update counters with values
 *   yield* Metric.update(requestCounter, 1) // Increment by 1
 *   yield* Metric.update(requestCounter, 5) // Increment by 5 (total: 6)
 *   yield* Metric.update(eventCounter, 1) // Increment by 1
 *   yield* Metric.update(bytesCounter, 1024n) // Add 1024 bytes
 * 
 *   // Get current counter values
 *   const requestValue = yield* Metric.value(requestCounter)
 *   const eventValue = yield* Metric.value(eventCounter)
 *   const bytesValue = yield* Metric.value(bytesCounter)
 * 
 *   return { requestValue, eventValue, bytesValue }
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
const exportName = "counter";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Represents a Counter metric that tracks cumulative numerical values over time. Counters can be incremented and decremented and provide a running total of changes.";
const sourceExample = "import { Data, Effect, Metric } from \"effect\"\n\nclass CounterError extends Data.TaggedError(\"CounterError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create a basic counter for tracking requests\n  const requestCounter = Metric.counter(\"http_requests_total\", {\n    description: \"Total number of HTTP requests processed\"\n  })\n\n  // Create an incremental-only counter for events\n  const eventCounter = Metric.counter(\"events_processed\", {\n    description: \"Events processed (increment only)\",\n    incremental: true\n  })\n\n  // Create a bigint counter for large values\n  const bytesCounter = Metric.counter(\"bytes_transferred\", {\n    description: \"Total bytes transferred\",\n    bigint: true,\n    attributes: { service: \"file-transfer\" }\n  })\n\n  // Update counters with values\n  yield* Metric.update(requestCounter, 1) // Increment by 1\n  yield* Metric.update(requestCounter, 5) // Increment by 5 (total: 6)\n  yield* Metric.update(eventCounter, 1) // Increment by 1\n  yield* Metric.update(bytesCounter, 1024n) // Add 1024 bytes\n\n  // Get current counter values\n  const requestValue = yield* Metric.value(requestCounter)\n  const eventValue = yield* Metric.value(eventCounter)\n  const bytesValue = yield* Metric.value(bytesCounter)\n\n  return { requestValue, eventValue, bytesValue }\n})";
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
