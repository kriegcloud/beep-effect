/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/observability/PrometheusMetrics
 * Export: layerHttp
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/observability/PrometheusMetrics.ts
 * Generated: 2026-02-19T04:50:49.793Z
 *
 * Overview:
 * Creates a Layer that registers a `/metrics` HTTP endpoint for Prometheus scraping.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"
 *
 * // Create a layer that adds /metrics endpoint to the router
 * const PrometheusLayer = PrometheusMetrics.layerHttp()
 *
 * // Or customize the path and add a prefix to all metric names
 * const CustomPrometheusLayer = PrometheusMetrics.layerHttp({
 *   path: "/prometheus/metrics",
 *   prefix: "myapp"
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
const exportName = "layerHttp";
const exportKind = "const";
const moduleImportPath = "effect/unstable/observability/PrometheusMetrics";
const sourceSummary = "Creates a Layer that registers a `/metrics` HTTP endpoint for Prometheus scraping.";
const sourceExample =
  'import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"\n\n// Create a layer that adds /metrics endpoint to the router\nconst PrometheusLayer = PrometheusMetrics.layerHttp()\n\n// Or customize the path and add a prefix to all metric names\nconst CustomPrometheusLayer = PrometheusMetrics.layerHttp({\n  path: "/prometheus/metrics",\n  prefix: "myapp"\n})';
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
