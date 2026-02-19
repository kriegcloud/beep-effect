/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/LanguageModel
 * Export: ToolChoice
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts
 * Generated: 2026-02-19T04:14:23.924Z
 *
 * Overview:
 * The tool choice mode for the language model. - `auto` (default): The model can decide whether or not to call tools, as well as which tools to call. - `required`: The model **must** call a tool but can decide which tool will be called. - `none`: The model **must not** call a tool. - `{ tool: <tool_name> }`: The model must call the specified tool. - `{ mode?: "auto" (default) | "required", "oneOf": [<tool-names>] }`: The model is restricted to the subset of tools specified by `oneOf`. When `mode` is `"auto"` or omitted, the model can decide whether or not a tool from the allowed subset of tools can be called. When `mode` is `"required"`, the model **must** call one tool from the allowed subset of tools.
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LanguageModelModule from "effect/unstable/ai/LanguageModel";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ToolChoice";
const exportKind = "type";
const moduleImportPath = "effect/unstable/ai/LanguageModel";
const sourceSummary =
  "The tool choice mode for the language model. - `auto` (default): The model can decide whether or not to call tools, as well as which tools to call. - `required`: The model **mus...";
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
