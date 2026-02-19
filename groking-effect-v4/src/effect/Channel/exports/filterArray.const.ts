/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: filterArray
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.224Z
 *
 * Overview:
 * Filters arrays of elements emitted by a channel, applying the filter to each element within the arrays and only emitting non-empty filtered arrays.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Channel } from "effect"
 *
 * const nonEmptyArrayPredicate = Array.isReadonlyArrayNonEmpty
 *
 * // Create a channel that outputs arrays of mixed data
 * const arrayChannel = Channel.fromIterable([
 *   Array.make(1, 2, 3, 4, 5),
 *   Array.make(6, 7, 8, 9, 10),
 *   Array.make(11, 12, 13, 14, 15)
 * ]).pipe(Channel.filter(nonEmptyArrayPredicate))
 *
 * // Filter arrays to keep only even numbers
 * const evenArraysChannel = Channel.filterArray(arrayChannel, (n) => n % 2 === 0)
 * // Outputs: [2, 4], [6, 8, 10], [12, 14]
 * // Note: Only non-empty filtered arrays are emitted
 *
 * // Arrays that would become empty after filtering are discarded entirely
 * const oddChannel = Channel.fromIterable([
 *   Array.make(1, 3, 5),
 *   Array.make(2, 4),
 *   Array.make(7, 9)
 * ]).pipe(Channel.filter(nonEmptyArrayPredicate))
 * const filteredOddChannel = Channel.filterArray(oddChannel, (n) => n % 2 === 0)
 * // Outputs: [2, 4] (the arrays [1,3,5] and [7,9] are discarded)
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
const exportName = "filterArray";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Filters arrays of elements emitted by a channel, applying the filter to each element within the arrays and only emitting non-empty filtered arrays.";
const sourceExample =
  'import { Array, Channel } from "effect"\n\nconst nonEmptyArrayPredicate = Array.isReadonlyArrayNonEmpty\n\n// Create a channel that outputs arrays of mixed data\nconst arrayChannel = Channel.fromIterable([\n  Array.make(1, 2, 3, 4, 5),\n  Array.make(6, 7, 8, 9, 10),\n  Array.make(11, 12, 13, 14, 15)\n]).pipe(Channel.filter(nonEmptyArrayPredicate))\n\n// Filter arrays to keep only even numbers\nconst evenArraysChannel = Channel.filterArray(arrayChannel, (n) => n % 2 === 0)\n// Outputs: [2, 4], [6, 8, 10], [12, 14]\n// Note: Only non-empty filtered arrays are emitted\n\n// Arrays that would become empty after filtering are discarded entirely\nconst oddChannel = Channel.fromIterable([\n  Array.make(1, 3, 5),\n  Array.make(2, 4),\n  Array.make(7, 9)\n]).pipe(Channel.filter(nonEmptyArrayPredicate))\nconst filteredOddChannel = Channel.filterArray(oddChannel, (n) => n % 2 === 0)\n// Outputs: [2, 4] (the arrays [1,3,5] and [7,9] are discarded)';
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
