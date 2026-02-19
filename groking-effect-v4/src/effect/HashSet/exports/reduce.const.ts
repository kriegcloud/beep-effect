/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: reduce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Reduces the HashSet to a single value by iterating through the values and applying an accumulator function.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const numbers = HashSet.make(1, 2, 3, 4, 5)
 * const sum = HashSet.reduce(numbers, 0, (acc, n) => acc + n)
 *
 * console.log(sum) // 15
 *
 * const strings = HashSet.make("a", "b", "c")
 * const concatenated = HashSet.reduce(strings, "", (acc, s) => acc + s)
 * console.log(concatenated) // Order may vary: "abc", "bac", etc.
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
const exportName = "reduce";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary =
  "Reduces the HashSet to a single value by iterating through the values and applying an accumulator function.";
const sourceExample =
  'import * as HashSet from "effect/HashSet"\n\nconst numbers = HashSet.make(1, 2, 3, 4, 5)\nconst sum = HashSet.reduce(numbers, 0, (acc, n) => acc + n)\n\nconsole.log(sum) // 15\n\nconst strings = HashSet.make("a", "b", "c")\nconst concatenated = HashSet.reduce(strings, "", (acc, s) => acc + s)\nconsole.log(concatenated) // Order may vary: "abc", "bac", etc.';
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
