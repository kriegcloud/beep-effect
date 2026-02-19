/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: isMetric
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:50:37.745Z
 *
 * Overview:
 * Returns `true` if the specified value is a `Metric`, otherwise returns `false`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Metric } from "effect"
 *
 * const counter = Metric.counter("requests")
 * const gauge = Metric.gauge("temperature")
 * const notAMetric = { name: "fake-metric" }
 *
 * console.log(Metric.isMetric(counter)) // true
 * console.log(Metric.isMetric(gauge)) // true
 * console.log(Metric.isMetric(notAMetric)) // false
 * console.log(Metric.isMetric(null)) // false
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
const exportName = "isMetric";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Returns `true` if the specified value is a `Metric`, otherwise returns `false`.";
const sourceExample =
  'import { Metric } from "effect"\n\nconst counter = Metric.counter("requests")\nconst gauge = Metric.gauge("temperature")\nconst notAMetric = { name: "fake-metric" }\n\nconsole.log(Metric.isMetric(counter)) // true\nconsole.log(Metric.isMetric(gauge)) // true\nconsole.log(Metric.isMetric(notAMetric)) // false\nconsole.log(Metric.isMetric(null)) // false';
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
