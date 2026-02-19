/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:50:44.147Z
 *
 * Overview:
 * Creates a TxHashSet from an iterable collection of values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fromArray = yield* TxHashSet.fromIterable(["a", "b", "c", "b", "a"])
 *   console.log(yield* TxHashSet.size(fromArray)) // 3
 *
 *   const fromSet = yield* TxHashSet.fromIterable(new Set([1, 2, 3]))
 *   console.log(yield* TxHashSet.size(fromSet)) // 3
 *
 *   const fromString = yield* TxHashSet.fromIterable("hello")
 *   const values = yield* TxHashSet.toHashSet(fromString)
 *   console.log(Array.from(values)) // ["h", "e", "l", "o"]
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
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Creates a TxHashSet from an iterable collection of values.";
const sourceExample =
  'import { Effect, TxHashSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fromArray = yield* TxHashSet.fromIterable(["a", "b", "c", "b", "a"])\n  console.log(yield* TxHashSet.size(fromArray)) // 3\n\n  const fromSet = yield* TxHashSet.fromIterable(new Set([1, 2, 3]))\n  console.log(yield* TxHashSet.size(fromSet)) // 3\n\n  const fromString = yield* TxHashSet.fromIterable("hello")\n  const values = yield* TxHashSet.toHashSet(fromString)\n  console.log(Array.from(values)) // ["h", "e", "l", "o"]\n})';
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
