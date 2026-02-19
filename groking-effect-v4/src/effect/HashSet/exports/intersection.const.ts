/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: intersection
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:50:37.079Z
 *
 * Overview:
 * Creates the intersection of two HashSets.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set1 = HashSet.make("a", "b", "c")
 * const set2 = HashSet.make("b", "c", "d")
 * const common = HashSet.intersection(set1, set2)
 *
 * console.log(Array.from(common).sort()) // ["b", "c"]
 * console.log(HashSet.size(common)) // 2
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
import * as HashSetModule from "effect/HashSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "intersection";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Creates the intersection of two HashSets.";
const sourceExample =
  'import * as HashSet from "effect/HashSet"\n\nconst set1 = HashSet.make("a", "b", "c")\nconst set2 = HashSet.make("b", "c", "d")\nconst common = HashSet.intersection(set1, set2)\n\nconsole.log(Array.from(common).sort()) // ["b", "c"]\nconsole.log(HashSet.size(common)) // 2';
const moduleRecord = HashSetModule as Record<string, unknown>;

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
