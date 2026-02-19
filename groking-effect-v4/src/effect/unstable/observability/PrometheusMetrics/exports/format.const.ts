/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/observability/PrometheusMetrics
 * Export: format
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/observability/PrometheusMetrics.ts
 * Generated: 2026-02-19T04:50:49.793Z
 *
 * Overview:
 * Format all metrics in the registry to Prometheus exposition format.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Metric } from "effect"
 * import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"
 *
 * const program = Effect.gen(function*() {
 *   const counter = Metric.counter("api_requests_total", {
 *     description: "Total API requests"
 *   })
 *   const gauge = Metric.gauge("active_connections", {
 *     description: "Number of active connections"
 *   })
 *
 *   yield* Metric.update(counter, 100)
 *   yield* Metric.update(gauge, 25)
 *
 *   // Format without prefix
 *   const output1 = yield* PrometheusMetrics.format()
 *
 *   // Format with prefix
 *   const output2 = yield* PrometheusMetrics.format({ prefix: "myapp" })
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
import * as PrometheusMetricsModule from "effect/unstable/observability/PrometheusMetrics";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "format";
const exportKind = "const";
const moduleImportPath = "effect/unstable/observability/PrometheusMetrics";
const sourceSummary = "Format all metrics in the registry to Prometheus exposition format.";
const sourceExample =
  'import { Effect, Metric } from "effect"\nimport * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"\n\nconst program = Effect.gen(function*() {\n  const counter = Metric.counter("api_requests_total", {\n    description: "Total API requests"\n  })\n  const gauge = Metric.gauge("active_connections", {\n    description: "Number of active connections"\n  })\n\n  yield* Metric.update(counter, 100)\n  yield* Metric.update(gauge, 25)\n\n  // Format without prefix\n  const output1 = yield* PrometheusMetrics.format()\n\n  // Format with prefix\n  const output2 = yield* PrometheusMetrics.format({ prefix: "myapp" })\n})';
const moduleRecord = PrometheusMetricsModule as Record<string, unknown>;

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
