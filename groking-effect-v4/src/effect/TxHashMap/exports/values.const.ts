/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: values
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.962Z
 *
 * Overview:
 * Returns an array of all values in the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const scores = yield* TxHashMap.make(
 *     ["alice", 95],
 *     ["bob", 87],
 *     ["charlie", 92]
 *   )
 *
 *   const allScores = yield* TxHashMap.values(scores)
 *   console.log(allScores.sort()) // [87, 92, 95]
 *
 *   // Calculate average
 *   const average = allScores.reduce((sum, score) => sum + score, 0) /
 *     allScores.length
 *   console.log(average) // 91.33
 *
 *   // Find maximum
 *   const maxScore = Math.max(...allScores)
 *   console.log(maxScore) // 95
 * })
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "values";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Returns an array of all values in the TxHashMap.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const scores = yield* TxHashMap.make(\n    ["alice", 95],\n    ["bob", 87],\n    ["charlie", 92]\n  )\n\n  const allScores = yield* TxHashMap.values(scores)\n  console.log(allScores.sort()) // [87, 92, 95]\n\n  // Calculate average\n  const average = allScores.reduce((sum, score) => sum + score, 0) /\n    allScores.length\n  console.log(average) // 91.33\n\n  // Find maximum\n  const maxScore = Math.max(...allScores)\n  console.log(maxScore) // 95\n})';
const moduleRecord = TxHashMapModule as Record<string, unknown>;

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
