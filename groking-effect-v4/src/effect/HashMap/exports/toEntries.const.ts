/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: toEntries
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:50:36.921Z
 *
 * Overview:
 * Returns an `Array<[K, V]>` of the entries within the `HashMap`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const gameScores = HashMap.make(
 *   ["alice", 1250],
 *   ["bob", 980],
 *   ["charlie", 1100]
 * )
 *
 * // Convert to entries for processing
 * const scoreEntries = HashMap.toEntries(gameScores)
 *
 * // Sort by score (descending)
 * const leaderboard = scoreEntries
 *   .sort(([, a], [, b]) => b - a)
 *   .map(([player, score], rank) => `${rank + 1}. ${player}: ${score}`)
 *
 * console.log(leaderboard)
 * // ["1. alice: 1250", "2. charlie: 1100", "3. bob: 980"]
 *
 * // Convert back to HashMap if needed
 * const sortedMap = HashMap.fromIterable(scoreEntries)
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
import * as HashMapModule from "effect/HashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toEntries";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Returns an `Array<[K, V]>` of the entries within the `HashMap`.";
const sourceExample =
  'import * as HashMap from "effect/HashMap"\n\nconst gameScores = HashMap.make(\n  ["alice", 1250],\n  ["bob", 980],\n  ["charlie", 1100]\n)\n\n// Convert to entries for processing\nconst scoreEntries = HashMap.toEntries(gameScores)\n\n// Sort by score (descending)\nconst leaderboard = scoreEntries\n  .sort(([, a], [, b]) => b - a)\n  .map(([player, score], rank) => `${rank + 1}. ${player}: ${score}`)\n\nconsole.log(leaderboard)\n// ["1. alice: 1250", "2. charlie: 1100", "3. bob: 980"]\n\n// Convert back to HashMap if needed\nconst sortedMap = HashMap.fromIterable(scoreEntries)';
const moduleRecord = HashMapModule as Record<string, unknown>;

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
