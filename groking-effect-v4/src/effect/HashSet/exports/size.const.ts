/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:50:37.080Z
 *
 * Overview:
 * Returns the number of values in the HashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const empty = HashSet.empty<string>()
 * console.log(HashSet.size(empty)) // 0
 *
 * const small = HashSet.make("a", "b")
 * console.log(HashSet.size(small)) // 2
 *
 * const withDuplicates = HashSet.fromIterable(["x", "y", "z", "x", "y"])
 * console.log(HashSet.size(withDuplicates)) // 3
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
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Returns the number of values in the HashSet.";
const sourceExample =
  'import * as HashSet from "effect/HashSet"\n\nconst empty = HashSet.empty<string>()\nconsole.log(HashSet.size(empty)) // 0\n\nconst small = HashSet.make("a", "b")\nconsole.log(HashSet.size(small)) // 2\n\nconst withDuplicates = HashSet.fromIterable(["x", "y", "z", "x", "y"])\nconsole.log(HashSet.size(withDuplicates)) // 3';
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
