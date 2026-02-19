/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: RawInput
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:50:45.758Z
 *
 * Overview:
 * Raw input types that can be converted into a Prompt.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Prompt } from "effect/unstable/ai"
 *
 * // String input - creates a user message
 * const stringInput: Prompt.RawInput = "Hello, world!"
 *
 * // Message array input
 * const messagesInput: Prompt.RawInput = [
 *   { role: "system", content: "You are helpful." },
 *   { role: "user", content: [{ type: "text", text: "Hi!" }] }
 * ]
 *
 * // Existing prompt
 * declare const existingPrompt: Prompt.Prompt
 * const promptInput: Prompt.RawInput = existingPrompt
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PromptModule from "effect/unstable/ai/Prompt";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "RawInput";
const exportKind = "type";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary = "Raw input types that can be converted into a Prompt.";
const sourceExample =
  'import type { Prompt } from "effect/unstable/ai"\n\n// String input - creates a user message\nconst stringInput: Prompt.RawInput = "Hello, world!"\n\n// Message array input\nconst messagesInput: Prompt.RawInput = [\n  { role: "system", content: "You are helpful." },\n  { role: "user", content: [{ type: "text", text: "Hi!" }] }\n]\n\n// Existing prompt\ndeclare const existingPrompt: Prompt.Prompt\nconst promptInput: Prompt.RawInput = existingPrompt';
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
