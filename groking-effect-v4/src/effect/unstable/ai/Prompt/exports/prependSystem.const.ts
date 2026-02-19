/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: prependSystem
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:50:45.758Z
 *
 * Overview:
 * Creates a new prompt from the specified prompt with the provided text content prepended to the start of existing system message content.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const systemPrompt = Prompt.make([{
 *   role: "system",
 *   content: "You are an expert in programming."
 * }])
 *
 * const userPrompt = Prompt.make("Hello, world!")
 *
 * const prompt = Prompt.concat(systemPrompt, userPrompt)
 *
 * const replaced = Prompt.prependSystem(
 *   prompt,
 *   "You are a helpful assistant. "
 * )
 * // result content: "You are a helpful assistant. You are an expert in programming."
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
import * as PromptModule from "effect/unstable/ai/Prompt";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "prependSystem";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary =
  "Creates a new prompt from the specified prompt with the provided text content prepended to the start of existing system message content.";
const sourceExample =
  'import { Prompt } from "effect/unstable/ai"\n\nconst systemPrompt = Prompt.make([{\n  role: "system",\n  content: "You are an expert in programming."\n}])\n\nconst userPrompt = Prompt.make("Hello, world!")\n\nconst prompt = Prompt.concat(systemPrompt, userPrompt)\n\nconst replaced = Prompt.prependSystem(\n  prompt,\n  "You are a helpful assistant. "\n)\n// result content: "You are a helpful assistant. You are an expert in programming."';
const moduleRecord = PromptModule as Record<string, unknown>;

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
