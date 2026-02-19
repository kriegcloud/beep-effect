/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:50:44.146Z
 *
 * Overview:
 * Removes all values from the TxHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const txSet = yield* TxHashSet.make("a", "b", "c")
 *   console.log(yield* TxHashSet.size(txSet)) // 3
 *
 *   yield* TxHashSet.clear(txSet)
 *   console.log(yield* TxHashSet.size(txSet)) // 0
 *   console.log(yield* TxHashSet.isEmpty(txSet)) // true
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
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Removes all values from the TxHashSet.";
const sourceExample =
  'import { Effect, TxHashSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const txSet = yield* TxHashSet.make("a", "b", "c")\n  console.log(yield* TxHashSet.size(txSet)) // 3\n\n  yield* TxHashSet.clear(txSet)\n  console.log(yield* TxHashSet.size(txSet)) // 0\n  console.log(yield* TxHashSet.isEmpty(txSet)) // true\n})';
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
