/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: UserMessage
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:14:24.061Z
 *
 * Overview:
 * Message representing user input or questions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const textUserMessage: Prompt.UserMessage = Prompt.makeMessage("user", {
 *   content: [
 *     Prompt.makePart("text", {
 *       text: "Can you analyze this image for me?"
 *     })
 *   ]
 * })
 *
 * const multimodalUserMessage: Prompt.UserMessage = Prompt.makeMessage("user", {
 *   content: [
 *     Prompt.makePart("text", {
 *       text: "What do you see in this image?"
 *     }),
 *     Prompt.makePart("file", {
 *       mediaType: "image/jpeg",
 *       fileName: "vacation.jpg",
 *       data: "data:image/jpeg;base64,..."
 *     })
 *   ]
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
const exportName = "UserMessage";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary = "Message representing user input or questions.";
const sourceExample =
  'import { Prompt } from "effect/unstable/ai"\n\nconst textUserMessage: Prompt.UserMessage = Prompt.makeMessage("user", {\n  content: [\n    Prompt.makePart("text", {\n      text: "Can you analyze this image for me?"\n    })\n  ]\n})\n\nconst multimodalUserMessage: Prompt.UserMessage = Prompt.makeMessage("user", {\n  content: [\n    Prompt.makePart("text", {\n      text: "What do you see in this image?"\n    }),\n    Prompt.makePart("file", {\n      mediaType: "image/jpeg",\n      fileName: "vacation.jpg",\n      data: "data:image/jpeg;base64,..."\n    })\n  ]\n})';
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
