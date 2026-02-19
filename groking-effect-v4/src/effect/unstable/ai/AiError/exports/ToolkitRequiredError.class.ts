/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: ToolkitRequiredError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:14:23.847Z
 *
 * Overview:
 * Error indicating an operation requires a toolkit but none was provided.
 *
 * Source JSDoc Example:
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 * 
 * const error = new AiError.ToolkitRequiredError({
 *   pendingApprovals: ["GetWeather", "SendEmail"]
 * })
 * 
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Toolkit required to resolve pending tool approvals: GetWeather, SendEmail"
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
const exportName = "ToolkitRequiredError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary = "Error indicating an operation requires a toolkit but none was provided.";
const sourceExample = "import { AiError } from \"effect/unstable/ai\"\n\nconst error = new AiError.ToolkitRequiredError({\n  pendingApprovals: [\"GetWeather\", \"SendEmail\"]\n})\n\nconsole.log(error.isRetryable) // false\nconsole.log(error.message)\n// \"Toolkit required to resolve pending tool approvals: GetWeather, SendEmail\"";
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
