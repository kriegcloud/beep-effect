/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: RateLimitError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:14:23.847Z
 *
 * Overview:
 * Error indicating the request was rate limited.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration } from "effect"
 * import { AiError } from "effect/unstable/ai"
 * 
 * const rateLimitError = new AiError.RateLimitError({
 *   retryAfter: Duration.seconds(60)
 * })
 * 
 * console.log(rateLimitError.isRetryable) // true
 * console.log(rateLimitError.message) // "Rate limit exceeded. Retry after 1 minute"
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
const exportName = "RateLimitError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary = "Error indicating the request was rate limited.";
const sourceExample = "import { Duration } from \"effect\"\nimport { AiError } from \"effect/unstable/ai\"\n\nconst rateLimitError = new AiError.RateLimitError({\n  retryAfter: Duration.seconds(60)\n})\n\nconsole.log(rateLimitError.isRetryable) // true\nconsole.log(rateLimitError.message) // \"Rate limit exceeded. Retry after 1 minute\"";
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
