/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: ToolResultEncodingError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:50:45.138Z
 *
 * Overview:
 * Error indicating the tool result cannot be encoded for sending back to the model.
 *
 * Source JSDoc Example:
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolResultEncodingError({
 *   toolName: "GetWeather",
 *   toolResult: { circular: "ref" },
 *   description: "Cannot encode circular reference"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Failed to encode result for tool 'GetWeather': Cannot encode circular reference"
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
const exportName = "ToolResultEncodingError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary = "Error indicating the tool result cannot be encoded for sending back to the model.";
const sourceExample =
  'import { AiError } from "effect/unstable/ai"\n\nconst error = new AiError.ToolResultEncodingError({\n  toolName: "GetWeather",\n  toolResult: { circular: "ref" },\n  description: "Cannot encode circular reference"\n})\n\nconsole.log(error.isRetryable) // false\nconsole.log(error.message)\n// "Failed to encode result for tool \'GetWeather\': Cannot encode circular reference"';
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
