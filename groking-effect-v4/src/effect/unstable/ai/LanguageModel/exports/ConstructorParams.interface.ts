/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/LanguageModel
 * Export: ConstructorParams
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts
 * Generated: 2026-02-19T04:14:23.923Z
 *
 * Overview:
 * Parameters required to construct a LanguageModel service.
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
import * as LanguageModelModule from "effect/unstable/ai/LanguageModel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ConstructorParams";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/LanguageModel";
const sourceSummary = "Parameters required to construct a LanguageModel service.";
const sourceExample = "";
const moduleRecord = LanguageModelModule as Record<string, unknown>;

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
