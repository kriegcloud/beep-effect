/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: FiberRuntimeMetricsService
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * Interface for the fiber runtime metrics service that tracks fiber lifecycle events.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { ServiceMap } from "effect"
 * import { Data, Effect, Layer, Metric } from "effect"
 * import type { Exit } from "effect/Exit"
 *
 * class MetricsError extends Data.TaggedError("MetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Custom implementation of the metrics service
 * const customMetricsService: Metric.FiberRuntimeMetricsService = {
 *   recordFiberStart: (context: ServiceMap.ServiceMap<never>) => {
 *     console.log("Fiber started")
 *     // Custom logic for tracking fiber starts
 *   },
 *   recordFiberEnd: (
 *     context: ServiceMap.ServiceMap<never>,
 *     exit: Exit<unknown, unknown>
 *   ) => {
 *     console.log("Fiber completed with exit:", exit)
 *     // Custom logic for tracking fiber completion based on exit status
 *   }
 * }
 *
 * const program = Effect.gen(function*() {
 *   // Use the custom metrics service
 *   const layer = Layer.succeed(Metric.FiberRuntimeMetrics)(customMetricsService)
 *
 *   return yield* Effect.sleep("100 millis").pipe(Effect.provide(layer))
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
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FiberRuntimeMetricsService";
const exportKind = "interface";
const moduleImportPath = "effect/Metric";
const sourceSummary = "Interface for the fiber runtime metrics service that tracks fiber lifecycle events.";
const sourceExample =
  'import type { ServiceMap } from "effect"\nimport { Data, Effect, Layer, Metric } from "effect"\nimport type { Exit } from "effect/Exit"\n\nclass MetricsError extends Data.TaggedError("MetricsError")<{\n  readonly operation: string\n}> {}\n\n// Custom implementation of the metrics service\nconst customMetricsService: Metric.FiberRuntimeMetricsService = {\n  recordFiberStart: (context: ServiceMap.ServiceMap<never>) => {\n    console.log("Fiber started")\n    // Custom logic for tracking fiber starts\n  },\n  recordFiberEnd: (\n    context: ServiceMap.ServiceMap<never>,\n    exit: Exit<unknown, unknown>\n  ) => {\n    console.log("Fiber completed with exit:", exit)\n    // Custom logic for tracking fiber completion based on exit status\n  }\n}\n\nconst program = Effect.gen(function*() {\n  // Use the custom metrics service\n  const layer = Layer.succeed(Metric.FiberRuntimeMetrics)(customMetricsService)\n\n  return yield* Effect.sleep("100 millis").pipe(Effect.provide(layer))\n})';
const moduleRecord = MetricModule as Record<string, unknown>;

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
