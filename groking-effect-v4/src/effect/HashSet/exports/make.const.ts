/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:50:37.080Z
 *
 * Overview:
 * Creates a HashSet from a variable number of values.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const fruits = HashSet.make("apple", "banana", "cherry")
 * console.log(HashSet.size(fruits)) // 3
 *
 * const numbers = HashSet.make(1, 2, 3, 2, 1) // Duplicates ignored
 * console.log(HashSet.size(numbers)) // 3
 *
 * const mixed = HashSet.make("hello", 42, true)
 * console.log(HashSet.size(mixed)) // 3
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Creates a HashSet from a variable number of values.";
const sourceExample =
  'import * as HashSet from "effect/HashSet"\n\nconst fruits = HashSet.make("apple", "banana", "cherry")\nconsole.log(HashSet.size(fruits)) // 3\n\nconst numbers = HashSet.make(1, 2, 3, 2, 1) // Duplicates ignored\nconsole.log(HashSet.size(numbers)) // 3\n\nconst mixed = HashSet.make("hello", 42, true)\nconsole.log(HashSet.size(mixed)) // 3';
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
