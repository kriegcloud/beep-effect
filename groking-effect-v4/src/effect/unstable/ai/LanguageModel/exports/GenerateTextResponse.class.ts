/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/LanguageModel
 * Export: GenerateTextResponse
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts
 * Generated: 2026-02-19T04:50:45.272Z
 *
 * Overview:
 * Response class for text generation operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateText({
 *     prompt: "Explain photosynthesis"
 *   })
 *
 *   console.log(response.text) // Generated text content
 *   console.log(response.finishReason) // "stop", "length", etc.
 *   console.log(response.usage) // Usage information
 *
 *   return response
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LanguageModelModule from "effect/unstable/ai/LanguageModel";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "GenerateTextResponse";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/LanguageModel";
const sourceSummary = "Response class for text generation operations.";
const sourceExample =
  'import { Effect } from "effect"\nimport { LanguageModel } from "effect/unstable/ai"\n\nconst program = Effect.gen(function*() {\n  const response = yield* LanguageModel.generateText({\n    prompt: "Explain photosynthesis"\n  })\n\n  console.log(response.text) // Generated text content\n  console.log(response.finishReason) // "stop", "length", etc.\n  console.log(response.usage) // Usage information\n\n  return response\n})';
const moduleRecord = LanguageModelModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
