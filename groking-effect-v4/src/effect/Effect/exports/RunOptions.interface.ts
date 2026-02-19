/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: RunOptions
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * Configuration options for running Effect programs, providing control over interruption and scheduling behavior.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.sleep("2 seconds")
 *   return "completed"
 * })
 *
 * // Run with abort signal for cancellation
 * const controller = new AbortController()
 * const options: Effect.RunOptions = {
 *   signal: controller.signal
 * }
 *
 * const fiber = Effect.runFork(program, options)
 * // Later: controller.abort() to cancel
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "RunOptions";
const exportKind = "interface";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Configuration options for running Effect programs, providing control over interruption and scheduling behavior.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.sleep("2 seconds")\n  return "completed"\n})\n\n// Run with abort signal for cancellation\nconst controller = new AbortController()\nconst options: Effect.RunOptions = {\n  signal: controller.signal\n}\n\nconst fiber = Effect.runFork(program, options)\n// Later: controller.abort() to cancel';
const moduleRecord = EffectModule as Record<string, unknown>;

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
