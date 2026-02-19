/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/observability/OtlpMetrics
 * Export: AggregationTemporality
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/observability/OtlpMetrics.ts
 * Generated: 2026-02-19T04:14:27.979Z
 *
 * Overview:
 * Determines how metric values relate to the time interval over which they are aggregated.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as OtlpMetrics from "effect/unstable/observability/OtlpMetrics"
 *
 * // Use delta temporality for backends that prefer it (e.g., Datadog, Dynatrace)
 * const metricsLayer = OtlpMetrics.layer({
 *   url: "http://localhost:4318/v1/metrics",
 *   temporality: "delta"
 * })
 *
 * // Use cumulative temporality for backends like Prometheus
 * const cumulativeLayer = OtlpMetrics.layer({
 *   url: "http://localhost:4318/v1/metrics",
 *   temporality: "cumulative" // This is the default
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OtlpMetricsModule from "effect/unstable/observability/OtlpMetrics";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "AggregationTemporality";
const exportKind = "type";
const moduleImportPath = "effect/unstable/observability/OtlpMetrics";
const sourceSummary = "Determines how metric values relate to the time interval over which they are aggregated.";
const sourceExample =
  'import * as OtlpMetrics from "effect/unstable/observability/OtlpMetrics"\n\n// Use delta temporality for backends that prefer it (e.g., Datadog, Dynatrace)\nconst metricsLayer = OtlpMetrics.layer({\n  url: "http://localhost:4318/v1/metrics",\n  temporality: "delta"\n})\n\n// Use cumulative temporality for backends like Prometheus\nconst cumulativeLayer = OtlpMetrics.layer({\n  url: "http://localhost:4318/v1/metrics",\n  temporality: "cumulative" // This is the default\n})';
const moduleRecord = OtlpMetricsModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
