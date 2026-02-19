/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: runForEach
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.228Z
 *
 * Overview:
 * Runs a channel and applies an effect to each output element.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Console, Data } from "effect"
 *
 * class ForEachError extends Data.TaggedError("ForEachError")<{
 *   readonly element: unknown
 * }> {}
 *
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Run forEach to log each element
 * const forEachEffect = Channel.runForEach(
 *   numbersChannel,
 *   (n) => Console.log(`Processing: ${n}`)
 * )
 *
 * // Logs: "Processing: 1", "Processing: 2", "Processing: 3"
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
const exportName = "runForEach";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Runs a channel and applies an effect to each output element.";
const sourceExample =
  'import { Channel, Console, Data } from "effect"\n\nclass ForEachError extends Data.TaggedError("ForEachError")<{\n  readonly element: unknown\n}> {}\n\n// Create a channel with numbers\nconst numbersChannel = Channel.fromIterable([1, 2, 3])\n\n// Run forEach to log each element\nconst forEachEffect = Channel.runForEach(\n  numbersChannel,\n  (n) => Console.log(`Processing: ${n}`)\n)\n\n// Logs: "Processing: 1", "Processing: 2", "Processing: 3"';
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
