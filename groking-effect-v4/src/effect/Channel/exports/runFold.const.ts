/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: runFold
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.228Z
 *
 * Overview:
 * Runs a channel and folds over all output elements with an accumulator.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class FoldError extends Data.TaggedError("FoldError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Fold to calculate sum
 * const sumEffect = Channel.runFold(numbersChannel, () => 0, (acc, n) => acc + n)
 *
 * // Effect.runSync(sumEffect) // Returns: 15
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
const exportName = "runFold";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Runs a channel and folds over all output elements with an accumulator.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass FoldError extends Data.TaggedError("FoldError")<{\n  readonly operation: string\n}> {}\n\n// Create a channel with numbers\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])\n\n// Fold to calculate sum\nconst sumEffect = Channel.runFold(numbersChannel, () => 0, (acc, n) => acc + n)\n\n// Effect.runSync(sumEffect) // Returns: 15';
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
