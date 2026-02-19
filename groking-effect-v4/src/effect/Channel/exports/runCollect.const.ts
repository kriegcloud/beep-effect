/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: runCollect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.228Z
 *
 * Overview:
 * Runs a channel and collects all output elements into an array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class CollectError extends Data.TaggedError("CollectError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel with elements
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Collect all elements into an array
 * const collectEffect = Channel.runCollect(numbersChannel)
 *
 * // Effect.runSync(collectEffect) // Returns: [1, 2, 3, 4, 5]
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
const exportName = "runCollect";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Runs a channel and collects all output elements into an array.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass CollectError extends Data.TaggedError("CollectError")<{\n  readonly reason: string\n}> {}\n\n// Create a channel with elements\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])\n\n// Collect all elements into an array\nconst collectEffect = Channel.runCollect(numbersChannel)\n\n// Effect.runSync(collectEffect) // Returns: [1, 2, 3, 4, 5]';
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
