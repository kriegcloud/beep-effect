/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: isHashSet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Checks if a value is a HashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set = HashSet.make(1, 2, 3)
 * const array = [1, 2, 3]
 *
 * console.log(HashSet.isHashSet(set)) // true
 * console.log(HashSet.isHashSet(array)) // false
 * console.log(HashSet.isHashSet(null)) // false
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
import * as HashSetModule from "effect/HashSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isHashSet";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Checks if a value is a HashSet.";
const sourceExample =
  'import * as HashSet from "effect/HashSet"\n\nconst set = HashSet.make(1, 2, 3)\nconst array = [1, 2, 3]\n\nconsole.log(HashSet.isHashSet(set)) // true\nconsole.log(HashSet.isHashSet(array)) // false\nconsole.log(HashSet.isHashSet(null)) // false';
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
