/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashSet
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashSet.ts
 * Generated: 2026-02-19T04:14:15.152Z
 *
 * Overview:
 * Removes all values from the MutableHashSet, mutating the set in place. The set becomes empty after this operation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.make("apple", "banana", "cherry")
 *
 * console.log(MutableHashSet.size(set)) // 3
 *
 * // Clear all values
 * MutableHashSet.clear(set)
 *
 * console.log(MutableHashSet.size(set)) // 0
 * console.log(MutableHashSet.has(set, "apple")) // false
 * console.log(Array.from(set)) // []
 *
 * // Can still add new values after clearing
 * MutableHashSet.add(set, "new")
 * console.log(MutableHashSet.size(set)) // 1
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
import * as MutableHashSetModule from "effect/MutableHashSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashSet";
const sourceSummary =
  "Removes all values from the MutableHashSet, mutating the set in place. The set becomes empty after this operation.";
const sourceExample =
  'import { MutableHashSet } from "effect"\n\nconst set = MutableHashSet.make("apple", "banana", "cherry")\n\nconsole.log(MutableHashSet.size(set)) // 3\n\n// Clear all values\nMutableHashSet.clear(set)\n\nconsole.log(MutableHashSet.size(set)) // 0\nconsole.log(MutableHashSet.has(set, "apple")) // false\nconsole.log(Array.from(set)) // []\n\n// Can still add new values after clearing\nMutableHashSet.add(set, "new")\nconsole.log(MutableHashSet.size(set)) // 1';
const moduleRecord = MutableHashSetModule as Record<string, unknown>;

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
