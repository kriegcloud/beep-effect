/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: some
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.177Z
 *
 * Overview:
 * Tests whether at least one value in the HashSet satisfies the predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const numbers = HashSet.make(1, 2, 3, 4, 5)
 *
 * console.log(HashSet.some(numbers, (n) => n > 3)) // true
 * console.log(HashSet.some(numbers, (n) => n > 10)) // false
 *
 * const empty = HashSet.empty<number>()
 * console.log(HashSet.some(empty, (n) => n > 0)) // false
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
const exportName = "some";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Tests whether at least one value in the HashSet satisfies the predicate.";
const sourceExample =
  'import * as HashSet from "effect/HashSet"\n\nconst numbers = HashSet.make(1, 2, 3, 4, 5)\n\nconsole.log(HashSet.some(numbers, (n) => n > 3)) // true\nconsole.log(HashSet.some(numbers, (n) => n > 10)) // false\n\nconst empty = HashSet.empty<number>()\nconsole.log(HashSet.some(empty, (n) => n > 0)) // false';
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
