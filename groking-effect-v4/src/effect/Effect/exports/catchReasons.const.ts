/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchReasons
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.907Z
 *
 * Overview:
 * Catches multiple reasons within a tagged error using an object of handlers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect } from "effect"
 *
 * class RateLimitError extends Data.TaggedError("RateLimitError")<{
 *   retryAfter: number
 * }> {}
 *
 * class QuotaExceededError extends Data.TaggedError("QuotaExceededError")<{
 *   limit: number
 * }> {}
 *
 * class AiError extends Data.TaggedError("AiError")<{
 *   reason: RateLimitError | QuotaExceededError
 * }> {}
 *
 * declare const program: Effect.Effect<string, AiError>
 *
 * const handled = program.pipe(
 *   Effect.catchReasons("AiError", {
 *     RateLimitError: (reason) =>
 *       Effect.succeed(`Retry after ${reason.retryAfter}s`),
 *     QuotaExceededError: (reason) =>
 *       Effect.succeed(`Quota exceeded: ${reason.limit}`)
 *   })
 * )
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchReasons";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Catches multiple reasons within a tagged error using an object of handlers.";
const sourceExample =
  'import { Data, Effect } from "effect"\n\nclass RateLimitError extends Data.TaggedError("RateLimitError")<{\n  retryAfter: number\n}> {}\n\nclass QuotaExceededError extends Data.TaggedError("QuotaExceededError")<{\n  limit: number\n}> {}\n\nclass AiError extends Data.TaggedError("AiError")<{\n  reason: RateLimitError | QuotaExceededError\n}> {}\n\ndeclare const program: Effect.Effect<string, AiError>\n\nconst handled = program.pipe(\n  Effect.catchReasons("AiError", {\n    RateLimitError: (reason) =>\n      Effect.succeed(`Retry after ${reason.retryAfter}s`),\n    QuotaExceededError: (reason) =>\n      Effect.succeed(`Quota exceeded: ${reason.limit}`)\n  })\n)';
const moduleRecord = EffectModule as Record<string, unknown>;

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
