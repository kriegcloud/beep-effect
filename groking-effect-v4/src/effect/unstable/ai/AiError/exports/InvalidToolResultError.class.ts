/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: InvalidToolResultError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:14:23.846Z
 *
 * Overview:
 * Error indicating the tool handler returned an invalid result that does not match the tool's schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 * 
 * const error = new AiError.InvalidToolResultError({
 *   toolName: "GetWeather",
 *   description: "Tool handler returned invalid result: missing 'temperature' field"
 * })
 * 
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Tool 'GetWeather' returned invalid result: missing 'temperature' field"
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as AiErrorModule from "effect/unstable/ai/AiError";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "InvalidToolResultError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary = "Error indicating the tool handler returned an invalid result that does not match the tool's schema.";
const sourceExample = "import { AiError } from \"effect/unstable/ai\"\n\nconst error = new AiError.InvalidToolResultError({\n  toolName: \"GetWeather\",\n  description: \"Tool handler returned invalid result: missing 'temperature' field\"\n})\n\nconsole.log(error.isRetryable) // false\nconsole.log(error.message)\n// \"Tool 'GetWeather' returned invalid result: missing 'temperature' field\"";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
