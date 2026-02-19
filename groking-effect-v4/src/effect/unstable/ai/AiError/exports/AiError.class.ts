/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: AiError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:14:23.846Z
 *
 * Overview:
 * Top-level AI error wrapper using the `reason` pattern.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { AiError } from "effect/unstable/ai"
 * 
 * declare const aiOperation: Effect.Effect<string, AiError.AiError>
 * 
 * // Handle specific reason types
 * const handled = aiOperation.pipe(
 *   Effect.catchTag("AiError", (error) => {
 *     if (error.reason._tag === "RateLimitError") {
 *       return Effect.succeed(`Retry after ${error.retryAfter}`)
 *     }
 *     return Effect.fail(error)
 *   })
 * )
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
const exportName = "AiError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary = "Top-level AI error wrapper using the `reason` pattern.";
const sourceExample = "import { Effect } from \"effect\"\nimport { AiError } from \"effect/unstable/ai\"\n\ndeclare const aiOperation: Effect.Effect<string, AiError.AiError>\n\n// Handle specific reason types\nconst handled = aiOperation.pipe(\n  Effect.catchTag(\"AiError\", (error) => {\n    if (error.reason._tag === \"RateLimitError\") {\n      return Effect.succeed(`Retry after ${error.retryAfter}`)\n    }\n    return Effect.fail(error)\n  })\n)";
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
