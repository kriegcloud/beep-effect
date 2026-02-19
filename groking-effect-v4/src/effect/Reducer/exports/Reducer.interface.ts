/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Reducer
 * Export: Reducer
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Reducer.ts
 * Generated: 2026-02-19T04:50:38.663Z
 *
 * Overview:
 * A `Reducer` is a `Combiner` with an `initialValue` and a way to combine a whole collection. Think `Array.prototype.reduce`, but reusable.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ReducerModule from "effect/Reducer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Reducer";
const exportKind = "interface";
const moduleImportPath = "effect/Reducer";
const sourceSummary =
  "A `Reducer` is a `Combiner` with an `initialValue` and a way to combine a whole collection. Think `Array.prototype.reduce`, but reusable.";
const sourceExample = "";
const moduleRecord = ReducerModule as Record<string, unknown>;

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
