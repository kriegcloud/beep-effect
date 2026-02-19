/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: difference
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:50:44.146Z
 *
 * Overview:
 * Creates the difference of two TxHashSets (elements in the first set that are not in the second), returning a new TxHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set1 = yield* TxHashSet.make("a", "b", "c")
 *   const set2 = yield* TxHashSet.make("b", "d")
 *   const diff = yield* TxHashSet.difference(set1, set2)
 *
 *   const values = yield* TxHashSet.toHashSet(diff)
 *   console.log(Array.from(values).sort()) // ["a", "c"]
 *   console.log(yield* TxHashSet.size(diff)) // 2
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxHashSetModule from "effect/TxHashSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "difference";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary =
  "Creates the difference of two TxHashSets (elements in the first set that are not in the second), returning a new TxHashSet.";
const sourceExample =
  'import { Effect, TxHashSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const set1 = yield* TxHashSet.make("a", "b", "c")\n  const set2 = yield* TxHashSet.make("b", "d")\n  const diff = yield* TxHashSet.difference(set1, set2)\n\n  const values = yield* TxHashSet.toHashSet(diff)\n  console.log(Array.from(values).sort()) // ["a", "c"]\n  console.log(yield* TxHashSet.size(diff)) // 2\n})';
const moduleRecord = TxHashSetModule as Record<string, unknown>;

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
