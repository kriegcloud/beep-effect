/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: InternalProviderError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:50:45.137Z
 *
 * Overview:
 * Error indicating the AI provider experienced an internal error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const providerError = new AiError.InternalProviderError({
 *   description: "Server encountered an unexpected error"
 * })
 *
 * console.log(providerError.isRetryable) // true
 * console.log(providerError.message)
 * // "Internal provider error: Server encountered an unexpected error"
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
const exportName = "InternalProviderError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary = "Error indicating the AI provider experienced an internal error.";
const sourceExample =
  'import { AiError } from "effect/unstable/ai"\n\nconst providerError = new AiError.InternalProviderError({\n  description: "Server encountered an unexpected error"\n})\n\nconsole.log(providerError.isRetryable) // true\nconsole.log(providerError.message)\n// "Internal provider error: Server encountered an unexpected error"';
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
