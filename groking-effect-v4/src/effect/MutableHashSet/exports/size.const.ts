/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashSet
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashSet.ts
 * Generated: 2026-02-19T04:50:37.834Z
 *
 * Overview:
 * Returns the number of unique values in the MutableHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.empty<string>()
 * console.log(MutableHashSet.size(set)) // 0
 *
 * MutableHashSet.add(set, "apple")
 * MutableHashSet.add(set, "banana")
 * MutableHashSet.add(set, "apple") // Duplicate
 * console.log(MutableHashSet.size(set)) // 2
 *
 * MutableHashSet.remove(set, "apple")
 * console.log(MutableHashSet.size(set)) // 1
 *
 * MutableHashSet.clear(set)
 * console.log(MutableHashSet.size(set)) // 0
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
import * as MutableHashSetModule from "effect/MutableHashSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashSet";
const sourceSummary = "Returns the number of unique values in the MutableHashSet.";
const sourceExample =
  'import { MutableHashSet } from "effect"\n\nconst set = MutableHashSet.empty<string>()\nconsole.log(MutableHashSet.size(set)) // 0\n\nMutableHashSet.add(set, "apple")\nMutableHashSet.add(set, "banana")\nMutableHashSet.add(set, "apple") // Duplicate\nconsole.log(MutableHashSet.size(set)) // 2\n\nMutableHashSet.remove(set, "apple")\nconsole.log(MutableHashSet.size(set)) // 1\n\nMutableHashSet.clear(set)\nconsole.log(MutableHashSet.size(set)) // 0';
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
