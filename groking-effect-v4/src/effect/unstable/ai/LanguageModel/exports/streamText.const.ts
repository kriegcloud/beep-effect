/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/LanguageModel
 * Export: streamText
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts
 * Generated: 2026-02-19T04:50:45.272Z
 *
 * Overview:
 * Generate text using a language model with streaming output.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const program = LanguageModel.streamText({
 *   prompt: "Write a story about a space explorer"
 * }).pipe(Stream.runForEach((part) => {
 *   if (part.type === "text-delta") {
 *     return Console.log(part.delta)
 *   }
 *   return Effect.void
 * }))
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LanguageModelModule from "effect/unstable/ai/LanguageModel";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "streamText";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/LanguageModel";
const sourceSummary = "Generate text using a language model with streaming output.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\nimport { LanguageModel } from "effect/unstable/ai"\n\nconst program = LanguageModel.streamText({\n  prompt: "Write a story about a space explorer"\n}).pipe(Stream.runForEach((part) => {\n  if (part.type === "text-delta") {\n    return Console.log(part.delta)\n  }\n  return Effect.void\n}))';
const moduleRecord = LanguageModelModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
