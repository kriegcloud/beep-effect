/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: union
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.139Z
 *
 * Overview:
 * Creates the union of two TxHashSets, returning a new TxHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set1 = yield* TxHashSet.make("a", "b")
 *   const set2 = yield* TxHashSet.make("b", "c")
 *   const combined = yield* TxHashSet.union(set1, set2)
 *
 *   const values = yield* TxHashSet.toHashSet(combined)
 *   console.log(Array.from(values).sort()) // ["a", "b", "c"]
 *   console.log(yield* TxHashSet.size(combined)) // 3
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
const exportName = "union";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Creates the union of two TxHashSets, returning a new TxHashSet.";
const sourceExample =
  'import { Effect, TxHashSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const set1 = yield* TxHashSet.make("a", "b")\n  const set2 = yield* TxHashSet.make("b", "c")\n  const combined = yield* TxHashSet.union(set1, set2)\n\n  const values = yield* TxHashSet.toHashSet(combined)\n  console.log(Array.from(values).sort()) // ["a", "b", "c"]\n  console.log(yield* TxHashSet.size(combined)) // 3\n})';
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
