/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: catchCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.635Z
 *
 * Overview:
 * Catches any cause of failure from the channel and allows recovery by creating a new channel based on the caught cause.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Channel, Data } from "effect"
 * 
 * class ProcessError extends Data.TaggedError("ProcessError")<{
 *   readonly reason: string
 * }> {}
 * 
 * class RecoveryError extends Data.TaggedError("RecoveryError")<{
 *   readonly message: string
 * }> {}
 * 
 * // Create a failing channel
 * const failingChannel = Channel.fail(
 *   new ProcessError({ reason: "network error" })
 * )
 * 
 * // Catch the cause and provide recovery
 * const recoveredChannel = Channel.catchCause(failingChannel, (cause) => {
 *   if (Cause.hasFails(cause)) {
 *     return Channel.succeed("Recovered from failure")
 *   }
 *   return Channel.succeed("Recovered from interruption")
 * })
 * 
 * // The channel recovers gracefully from errors
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
import * as ChannelModule from "effect/Channel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchCause";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Catches any cause of failure from the channel and allows recovery by creating a new channel based on the caught cause.";
const sourceExample = "import { Cause, Channel, Data } from \"effect\"\n\nclass ProcessError extends Data.TaggedError(\"ProcessError\")<{\n  readonly reason: string\n}> {}\n\nclass RecoveryError extends Data.TaggedError(\"RecoveryError\")<{\n  readonly message: string\n}> {}\n\n// Create a failing channel\nconst failingChannel = Channel.fail(\n  new ProcessError({ reason: \"network error\" })\n)\n\n// Catch the cause and provide recovery\nconst recoveredChannel = Channel.catchCause(failingChannel, (cause) => {\n  if (Cause.hasFails(cause)) {\n    return Channel.succeed(\"Recovered from failure\")\n  }\n  return Channel.succeed(\"Recovered from interruption\")\n})\n\n// The channel recovers gracefully from errors";
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
