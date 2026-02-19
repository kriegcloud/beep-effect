/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: NetworkError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:14:23.846Z
 *
 * Overview:
 * Error indicating a network-level failure before receiving a response.
 *
 * Source JSDoc Example:
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 * 
 * const error = new AiError.NetworkError({
 *   reason: "TransportError",
 *   request: {
 *     method: "POST",
 *     url: "https://api.openai.com/v1/completions",
 *     urlParams: [],
 *     hash: undefined,
 *     headers: { "Content-Type": "application/json" }
 *   },
 *   description: "Connection timeout after 30 seconds"
 * })
 * 
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Transport: Connection timeout after 30 seconds (POST https://api.openai.com/v1/completions)"
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
const exportName = "NetworkError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary = "Error indicating a network-level failure before receiving a response.";
const sourceExample = "import { AiError } from \"effect/unstable/ai\"\n\nconst error = new AiError.NetworkError({\n  reason: \"TransportError\",\n  request: {\n    method: \"POST\",\n    url: \"https://api.openai.com/v1/completions\",\n    urlParams: [],\n    hash: undefined,\n    headers: { \"Content-Type\": \"application/json\" }\n  },\n  description: \"Connection timeout after 30 seconds\"\n})\n\nconsole.log(error.isRetryable) // true\nconsole.log(error.message)\n// \"Transport: Connection timeout after 30 seconds (POST https://api.openai.com/v1/completions)\"";
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
