/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: every
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:50:44.146Z
 *
 * Overview:
 * Tests whether all values in the TxHashSet satisfy the predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const numbers = yield* TxHashSet.make(2, 4, 6, 8)
 *
 *   console.log(yield* TxHashSet.every(numbers, (n) => n % 2 === 0)) // true
 *   console.log(yield* TxHashSet.every(numbers, (n) => n > 5)) // false
 *
 *   const empty = yield* TxHashSet.empty<number>()
 *   console.log(yield* TxHashSet.every(empty, (n) => n > 0)) // true (vacuously true)
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
const exportName = "every";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Tests whether all values in the TxHashSet satisfy the predicate.";
const sourceExample =
  'import { Effect, TxHashSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const numbers = yield* TxHashSet.make(2, 4, 6, 8)\n\n  console.log(yield* TxHashSet.every(numbers, (n) => n % 2 === 0)) // true\n  console.log(yield* TxHashSet.every(numbers, (n) => n > 5)) // false\n\n  const empty = yield* TxHashSet.empty<number>()\n  console.log(yield* TxHashSet.every(empty, (n) => n > 0)) // true (vacuously true)\n})';
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
