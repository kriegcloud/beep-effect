/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: ToolCallPart
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:14:24.061Z
 *
 * Overview:
 * Content part representing a tool call request.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const toolCallPart: Prompt.ToolCallPart = Prompt.makePart("tool-call", {
 *   id: "call_123",
 *   name: "get_weather",
 *   params: { city: "San Francisco", units: "celsius" },
 *   providerExecuted: false
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
import * as PromptModule from "effect/unstable/ai/Prompt";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ToolCallPart";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary = "Content part representing a tool call request.";
const sourceExample =
  'import { Prompt } from "effect/unstable/ai"\n\nconst toolCallPart: Prompt.ToolCallPart = Prompt.makePart("tool-call", {\n  id: "call_123",\n  name: "get_weather",\n  params: { city: "San Francisco", units: "celsius" },\n  providerExecuted: false\n})';
const moduleRecord = PromptModule as Record<string, unknown>;

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
