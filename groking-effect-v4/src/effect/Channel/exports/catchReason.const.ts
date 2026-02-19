/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: catchReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.223Z
 *
 * Overview:
 * Catches a specific reason within a tagged error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
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
 * const channel = Channel.fail(
 *   new AiError({ reason: new RateLimitError({ retryAfter: 60 }) })
 * )
 *
 * const recovered = channel.pipe(
 *   Channel.catchReason("AiError", "RateLimitError", (reason) =>
 *     Channel.succeed(`retry: ${reason.retryAfter}`)
 *   )
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
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchReason";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Catches a specific reason within a tagged error.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass RateLimitError extends Data.TaggedError("RateLimitError")<{\n  retryAfter: number\n}> {}\n\nclass QuotaExceededError extends Data.TaggedError("QuotaExceededError")<{\n  limit: number\n}> {}\n\nclass AiError extends Data.TaggedError("AiError")<{\n  reason: RateLimitError | QuotaExceededError\n}> {}\n\nconst channel = Channel.fail(\n  new AiError({ reason: new RateLimitError({ retryAfter: 60 }) })\n)\n\nconst recovered = channel.pipe(\n  Channel.catchReason("AiError", "RateLimitError", (reason) =>\n    Channel.succeed(`retry: ${reason.retryAfter}`)\n  )\n)';
const moduleRecord = ChannelModule as Record<string, unknown>;

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
