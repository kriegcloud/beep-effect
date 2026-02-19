/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: summaryWithTimestamp
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.747Z
 *
 * Overview:
 * Creates a `Summary` metric that records observations and calculates quantiles which takes a value and the current timestamp as input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Metric } from "effect"
 *
 * const responseTimesSummary = Metric.summaryWithTimestamp(
 *   "response_times_summary",
 *   {
 *     description: "Measures the distribution of response times",
 *     maxAge: "60 seconds", // Retain observations for 60 seconds.
 *     maxSize: 1000, // Keep a maximum of 1000 observations.
 *     quantiles: [0.5, 0.9, 0.99] // Calculate 50th, 90th, and 99th quantiles.
 *   }
 * )
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
const exportName = "summaryWithTimestamp";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary =
  "Creates a `Summary` metric that records observations and calculates quantiles which takes a value and the current timestamp as input.";
const sourceExample =
  'import { Metric } from "effect"\n\nconst responseTimesSummary = Metric.summaryWithTimestamp(\n  "response_times_summary",\n  {\n    description: "Measures the distribution of response times",\n    maxAge: "60 seconds", // Retain observations for 60 seconds.\n    maxSize: 1000, // Keep a maximum of 1000 observations.\n    quantiles: [0.5, 0.9, 0.99] // Calculate 50th, 90th, and 99th quantiles.\n  }\n)';
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
