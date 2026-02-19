/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: StructuredOutputError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:50:45.138Z
 *
 * Overview:
 * Error indicating the LLM generated text that does not conform to the requested structured output schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.StructuredOutputError({
 *   description: "Expected a valid JSON object"
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Structured output validation failed: Expected a valid JSON object"
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
import * as AiErrorModule from "effect/unstable/ai/AiError";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "StructuredOutputError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary =
  "Error indicating the LLM generated text that does not conform to the requested structured output schema.";
const sourceExample =
  'import { AiError } from "effect/unstable/ai"\n\nconst error = new AiError.StructuredOutputError({\n  description: "Expected a valid JSON object"\n})\n\nconsole.log(error.isRetryable) // true\nconsole.log(error.message)\n// "Structured output validation failed: Expected a valid JSON object"';
const moduleRecord = AiErrorModule as Record<string, unknown>;

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
