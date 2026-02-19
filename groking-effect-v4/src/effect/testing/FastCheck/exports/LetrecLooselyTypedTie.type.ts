/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: LetrecLooselyTypedTie
 * Kind: type
 * Source: node_modules/fast-check/lib/types/arbitrary/letrec.d.ts
 * Generated: 2026-02-19T04:14:22.331Z
 *
 * Overview:
 * Loosely typed type for the `tie` function passed by {@link letrec} to the `builder` function we pass to it. You may want also want to use its strongly typed version {@link LetrecTypedTie}.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FastCheckModule from "effect/testing/FastCheck";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "LetrecLooselyTypedTie";
const exportKind = "type";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Loosely typed type for the `tie` function passed by {@link letrec} to the `builder` function we pass to it. You may want also want to use its strongly typed version {@link Letre...";
const sourceExample = "";
const moduleRecord = FastCheckModule as Record<string, unknown>;

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
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
