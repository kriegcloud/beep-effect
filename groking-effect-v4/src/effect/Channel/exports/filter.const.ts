/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.637Z
 *
 * Overview:
 * Filters the output elements of a channel using a predicate function. Elements that don't match the predicate are discarded.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel with mixed numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5, 6, 7, 8])
 *
 * // Filter to keep only even numbers
 * const evenChannel = Channel.filter(numbersChannel, (n) => n % 2 === 0)
 * // Outputs: 2, 4, 6, 8
 *
 * // Filter with type refinement
 * const mixedChannel = Channel.fromIterable([1, "hello", 2, "world", 3])
 * const numbersOnlyChannel = Channel.filter(
 *   mixedChannel,
 *   (value): value is number => typeof value === "number"
 * )
 * // Outputs: 1, 2, 3 (all typed as numbers)
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
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Filters the output elements of a channel using a predicate function. Elements that don't match the predicate are discarded.";
const sourceExample =
  'import { Channel } from "effect"\n\n// Create a channel with mixed numbers\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5, 6, 7, 8])\n\n// Filter to keep only even numbers\nconst evenChannel = Channel.filter(numbersChannel, (n) => n % 2 === 0)\n// Outputs: 2, 4, 6, 8\n\n// Filter with type refinement\nconst mixedChannel = Channel.fromIterable([1, "hello", 2, "world", 3])\nconst numbersOnlyChannel = Channel.filter(\n  mixedChannel,\n  (value): value is number => typeof value === "number"\n)\n// Outputs: 1, 2, 3 (all typed as numbers)';
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
