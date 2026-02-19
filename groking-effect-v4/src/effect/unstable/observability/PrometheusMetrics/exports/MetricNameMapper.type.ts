/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/observability/PrometheusMetrics
 * Export: MetricNameMapper
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/observability/PrometheusMetrics.ts
 * Generated: 2026-02-19T04:14:28.017Z
 *
 * Overview:
 * A function that transforms metric names before formatting.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"
 *
 * // Convert camelCase to snake_case
 * const mapper: PrometheusMetrics.MetricNameMapper = (name) =>
 *   name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()
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
import * as PrometheusMetricsModule from "effect/unstable/observability/PrometheusMetrics";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MetricNameMapper";
const exportKind = "type";
const moduleImportPath = "effect/unstable/observability/PrometheusMetrics";
const sourceSummary = "A function that transforms metric names before formatting.";
const sourceExample =
  'import type * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"\n\n// Convert camelCase to snake_case\nconst mapper: PrometheusMetrics.MetricNameMapper = (name) =>\n  name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()';
const moduleRecord = PrometheusMetricsModule as Record<string, unknown>;

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
