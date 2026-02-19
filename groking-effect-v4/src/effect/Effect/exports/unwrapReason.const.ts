/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: unwrapReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.917Z
 *
 * Overview:
 * Promotes nested reason errors into the Effect error channel, replacing the parent error.
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
 * // Before: Effect<string, AiError>
 * // After:  Effect<string, RateLimitError | QuotaExceededError>
 * const unwrapped = program.pipe(Effect.unwrapReason("AiError"))
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
const exportName = "unwrapReason";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Promotes nested reason errors into the Effect error channel, replacing the parent error.";
const sourceExample =
  'import { Data, Effect } from "effect"\n\nclass RateLimitError extends Data.TaggedError("RateLimitError")<{\n  retryAfter: number\n}> {}\n\nclass QuotaExceededError extends Data.TaggedError("QuotaExceededError")<{\n  limit: number\n}> {}\n\nclass AiError extends Data.TaggedError("AiError")<{\n  reason: RateLimitError | QuotaExceededError\n}> {}\n\ndeclare const program: Effect.Effect<string, AiError>\n\n// Before: Effect<string, AiError>\n// After:  Effect<string, RateLimitError | QuotaExceededError>\nconst unwrapped = program.pipe(Effect.unwrapReason("AiError"))';
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
