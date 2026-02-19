/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: Latch
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.389Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // Create and use a latch for coordination between fibers
 * const program = Effect.gen(function*() {
 *   const latch = yield* Effect.makeLatch()
 *
 *   // Wait for the latch to be opened
 *   yield* latch.await
 *
 *   return "Latch was opened!"
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Latch";
const exportKind = "interface";
const moduleImportPath = "effect/Effect";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect } from "effect"\n\n// Create and use a latch for coordination between fibers\nconst program = Effect.gen(function*() {\n  const latch = yield* Effect.makeLatch()\n\n  // Wait for the latch to be opened\n  yield* latch.await\n\n  return "Latch was opened!"\n})';
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
