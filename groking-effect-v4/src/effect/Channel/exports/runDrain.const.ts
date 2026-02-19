/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: runDrain
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.640Z
 *
 * Overview:
 * Runs a channel and discards all output elements, returning only the final result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class DrainError extends Data.TaggedError("DrainError")<{
 *   readonly stage: string
 * }> {}
 *
 * // Create a channel that outputs elements and completes with a result
 * const resultChannel = Channel.fromIterable([1, 2, 3])
 * const completedChannel = Channel.concatWith(
 *   resultChannel,
 *   () => Channel.succeed("completed")
 * )
 *
 * // Drain all elements and get only the final result
 * const drainEffect = Channel.runDrain(completedChannel)
 *
 * // Effect.runSync(drainEffect) // Returns: "completed"
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "runDrain";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Runs a channel and discards all output elements, returning only the final result.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass DrainError extends Data.TaggedError("DrainError")<{\n  readonly stage: string\n}> {}\n\n// Create a channel that outputs elements and completes with a result\nconst resultChannel = Channel.fromIterable([1, 2, 3])\nconst completedChannel = Channel.concatWith(\n  resultChannel,\n  () => Channel.succeed("completed")\n)\n\n// Drain all elements and get only the final result\nconst drainEffect = Channel.runDrain(completedChannel)\n\n// Effect.runSync(drainEffect) // Returns: "completed"';
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
