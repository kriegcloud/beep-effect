/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: catchReasons
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.436Z
 *
 * Overview:
 * Catches multiple reasons within a tagged error using an object of handlers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Data, Effect, Stream } from "effect"
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
 * const stream = Stream.fail(
 *   new AiError({ reason: new RateLimitError({ retryAfter: 60 }) })
 * )
 * 
 * const program = Effect.gen(function*() {
 *   const values = yield* stream.pipe(
 *     Stream.catchReasons("AiError", {
 *       RateLimitError: (reason) => Stream.succeed(`retry: ${reason.retryAfter}`),
 *       QuotaExceededError: (reason) => Stream.succeed(`quota: ${reason.limit}`)
 *     }),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(values)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: [ "retry: 60" ]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as StreamModule from "effect/Stream";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchReasons";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Catches multiple reasons within a tagged error using an object of handlers.";
const sourceExample = "import { Console, Data, Effect, Stream } from \"effect\"\n\nclass RateLimitError extends Data.TaggedError(\"RateLimitError\")<{\n  retryAfter: number\n}> {}\n\nclass QuotaExceededError extends Data.TaggedError(\"QuotaExceededError\")<{\n  limit: number\n}> {}\n\nclass AiError extends Data.TaggedError(\"AiError\")<{\n  reason: RateLimitError | QuotaExceededError\n}> {}\n\nconst stream = Stream.fail(\n  new AiError({ reason: new RateLimitError({ retryAfter: 60 }) })\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* stream.pipe(\n    Stream.catchReasons(\"AiError\", {\n      RateLimitError: (reason) => Stream.succeed(`retry: ${reason.retryAfter}`),\n      QuotaExceededError: (reason) => Stream.succeed(`quota: ${reason.limit}`)\n    }),\n    Stream.runCollect\n  )\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [ \"retry: 60\" ]";
const moduleRecord = StreamModule as Record<string, unknown>;

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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
