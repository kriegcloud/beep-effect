/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ExecutionPlan
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ExecutionPlan.ts
 * Generated: 2026-02-19T04:50:36.044Z
 *
 * Overview:
 * Create an `ExecutionPlan`, which can be used with `Effect.withExecutionPlan` or `Stream.withExecutionPlan`, allowing you to provide different resources for each step of execution until the effect succeeds or the plan is exhausted.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Layer } from "effect"
 * import { Effect, ExecutionPlan, Schedule } from "effect"
 * import type { LanguageModel } from "effect/unstable/ai"
 *
 * declare const layerBad: Layer.Layer<LanguageModel.LanguageModel>
 * declare const layerGood: Layer.Layer<LanguageModel.LanguageModel>
 *
 * const ThePlan = ExecutionPlan.make(
 *   {
 *     // First try with the bad layer 2 times with a 3 second delay between attempts
 *     provide: layerBad,
 *     attempts: 2,
 *     schedule: Schedule.spaced(3000)
 *   },
 *   // Then try with the bad layer 3 times with a 1 second delay between attempts
 *   {
 *     provide: layerBad,
 *     attempts: 3,
 *     schedule: Schedule.spaced(1000)
 *   },
 *   // Finally try with the good layer.
 *   //
 *   // If `attempts` is omitted, the plan will only attempt once, unless a schedule is provided.
 *   {
 *     provide: layerGood
 *   }
 * )
 *
 * declare const effect: Effect.Effect<
 *   void,
 *   never,
 *   LanguageModel.LanguageModel
 * >
 * const withPlan: Effect.Effect<void> = Effect.withExecutionPlan(effect, ThePlan)
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
import * as ExecutionPlanModule from "effect/ExecutionPlan";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/ExecutionPlan";
const sourceSummary =
  "Create an `ExecutionPlan`, which can be used with `Effect.withExecutionPlan` or `Stream.withExecutionPlan`, allowing you to provide different resources for each step of executio...";
const sourceExample =
  'import type { Layer } from "effect"\nimport { Effect, ExecutionPlan, Schedule } from "effect"\nimport type { LanguageModel } from "effect/unstable/ai"\n\ndeclare const layerBad: Layer.Layer<LanguageModel.LanguageModel>\ndeclare const layerGood: Layer.Layer<LanguageModel.LanguageModel>\n\nconst ThePlan = ExecutionPlan.make(\n  {\n    // First try with the bad layer 2 times with a 3 second delay between attempts\n    provide: layerBad,\n    attempts: 2,\n    schedule: Schedule.spaced(3000)\n  },\n  // Then try with the bad layer 3 times with a 1 second delay between attempts\n  {\n    provide: layerBad,\n    attempts: 3,\n    schedule: Schedule.spaced(1000)\n  },\n  // Finally try with the good layer.\n  //\n  // If `attempts` is omitted, the plan will only attempt once, unless a schedule is provided.\n  {\n    provide: layerGood\n  }\n)\n\ndeclare const effect: Effect.Effect<\n  void,\n  never,\n  LanguageModel.LanguageModel\n>\nconst withPlan: Effect.Effect<void> = Effect.withExecutionPlan(effect, ThePlan)';
const moduleRecord = ExecutionPlanModule as Record<string, unknown>;

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
