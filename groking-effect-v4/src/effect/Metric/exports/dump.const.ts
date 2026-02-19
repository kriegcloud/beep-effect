/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: dump
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * Returns a human-readable string representation of all currently registered metrics in a tabular format.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Data, Effect, Metric } from "effect"
 * 
 * class DumpError extends Data.TaggedError("DumpError")<{
 *   readonly operation: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   // Create and update some metrics for demonstration
 *   const requestCounter = Metric.counter("http_requests_total", {
 *     description: "Total HTTP requests"
 *   })
 *   const responseTime = Metric.gauge("response_time_ms", {
 *     description: "Current response time in milliseconds"
 *   })
 *   const statusFreq = Metric.frequency("http_status_codes", {
 *     description: "Frequency of HTTP status codes"
 *   })
 * 
 *   // Update metrics with some values
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(responseTime, 125)
 *   yield* Metric.update(statusFreq, "200")
 *   yield* Metric.update(statusFreq, "404")
 *   yield* Metric.update(statusFreq, "200")
 * 
 *   // Get formatted dump of all metrics
 *   const metricsReport = yield* Metric.dump
 *   yield* Console.log("Current Metrics:")
 *   yield* Console.log(metricsReport)
 * 
 *   // Output will look like a formatted table:
 *   // Name                  Description                           Type       State
 *   // http_requests_total   Total HTTP requests                   Counter    [count: 2]
 *   // response_time_ms      Current response time in milliseconds Gauge      [value: 125]
 *   // http_status_codes     Frequency of HTTP status codes       Frequency  [occurrences: 200 -> 2, 404 -> 1]
 * 
 *   return metricsReport
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
const exportName = "dump";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Returns a human-readable string representation of all currently registered metrics in a tabular format.";
const sourceExample = "import { Console, Data, Effect, Metric } from \"effect\"\n\nclass DumpError extends Data.TaggedError(\"DumpError\")<{\n  readonly operation: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  // Create and update some metrics for demonstration\n  const requestCounter = Metric.counter(\"http_requests_total\", {\n    description: \"Total HTTP requests\"\n  })\n  const responseTime = Metric.gauge(\"response_time_ms\", {\n    description: \"Current response time in milliseconds\"\n  })\n  const statusFreq = Metric.frequency(\"http_status_codes\", {\n    description: \"Frequency of HTTP status codes\"\n  })\n\n  // Update metrics with some values\n  yield* Metric.update(requestCounter, 1)\n  yield* Metric.update(requestCounter, 1)\n  yield* Metric.update(responseTime, 125)\n  yield* Metric.update(statusFreq, \"200\")\n  yield* Metric.update(statusFreq, \"404\")\n  yield* Metric.update(statusFreq, \"200\")\n\n  // Get formatted dump of all metrics\n  const metricsReport = yield* Metric.dump\n  yield* Console.log(\"Current Metrics:\")\n  yield* Console.log(metricsReport)\n\n  // Output will look like a formatted table:\n  // Name                  Description                           Type       State\n  // http_requests_total   Total HTTP requests                   Counter    [count: 2]\n  // response_time_ms      Current response time in milliseconds Gauge      [value: 125]\n  // http_status_codes     Frequency of HTTP status codes       Frequency  [occurrences: 200 -> 2, 404 -> 1]\n\n  return metricsReport\n})";
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
