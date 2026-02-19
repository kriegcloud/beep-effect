/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashSet
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableHashSet.ts
 * Generated: 2026-02-19T04:14:15.152Z
 *
 * Overview:
 * Creates a MutableHashSet from an iterable collection of values. Duplicates are automatically removed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const values = ["apple", "banana", "apple", "cherry", "banana"]
 * const set = MutableHashSet.fromIterable(values)
 *
 * console.log(MutableHashSet.size(set)) // 3
 * console.log(Array.from(set)) // ["apple", "banana", "cherry"]
 *
 * // Works with any iterable
 * const fromSet = MutableHashSet.fromIterable(new Set([1, 2, 3]))
 * console.log(MutableHashSet.size(fromSet)) // 3
 *
 * // From string characters
 * const fromString = MutableHashSet.fromIterable("hello")
 * console.log(Array.from(fromString)) // ["h", "e", "l", "o"]
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
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/MutableHashSet";
const sourceSummary =
  "Creates a MutableHashSet from an iterable collection of values. Duplicates are automatically removed.";
const sourceExample =
  'import { MutableHashSet } from "effect"\n\nconst values = ["apple", "banana", "apple", "cherry", "banana"]\nconst set = MutableHashSet.fromIterable(values)\n\nconsole.log(MutableHashSet.size(set)) // 3\nconsole.log(Array.from(set)) // ["apple", "banana", "cherry"]\n\n// Works with any iterable\nconst fromSet = MutableHashSet.fromIterable(new Set([1, 2, 3]))\nconsole.log(MutableHashSet.size(fromSet)) // 3\n\n// From string characters\nconst fromString = MutableHashSet.fromIterable("hello")\nconsole.log(Array.from(fromString)) // ["h", "e", "l", "o"]';
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
