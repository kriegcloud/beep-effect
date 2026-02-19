/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: isTxHashSet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.138Z
 *
 * Overview:
 * Checks if a value is a TxHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 * import * as HashSet from "effect/HashSet"
 *
 * const program = Effect.gen(function*() {
 *   const txSet = yield* TxHashSet.make(1, 2, 3)
 *   const hashSet = HashSet.make(1, 2, 3)
 *   const array = [1, 2, 3]
 *
 *   console.log(TxHashSet.isTxHashSet(txSet)) // true
 *   console.log(TxHashSet.isTxHashSet(hashSet)) // false
 *   console.log(TxHashSet.isTxHashSet(array)) // false
 *   console.log(TxHashSet.isTxHashSet(null)) // false
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxHashSetModule from "effect/TxHashSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isTxHashSet";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Checks if a value is a TxHashSet.";
const sourceExample =
  'import { Effect, TxHashSet } from "effect"\nimport * as HashSet from "effect/HashSet"\n\nconst program = Effect.gen(function*() {\n  const txSet = yield* TxHashSet.make(1, 2, 3)\n  const hashSet = HashSet.make(1, 2, 3)\n  const array = [1, 2, 3]\n\n  console.log(TxHashSet.isTxHashSet(txSet)) // true\n  console.log(TxHashSet.isTxHashSet(hashSet)) // false\n  console.log(TxHashSet.isTxHashSet(array)) // false\n  console.log(TxHashSet.isTxHashSet(null)) // false\n})';
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
