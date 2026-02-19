/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.138Z
 *
 * Overview:
 * Returns the number of values in the TxHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const empty = yield* TxHashSet.empty<string>()
 *   console.log(yield* TxHashSet.size(empty)) // 0
 *
 *   const small = yield* TxHashSet.make("a", "b")
 *   console.log(yield* TxHashSet.size(small)) // 2
 *
 *   const fromIterable = yield* TxHashSet.fromIterable(["x", "y", "z", "x", "y"])
 *   console.log(yield* TxHashSet.size(fromIterable)) // 3 (duplicates ignored)
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
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Returns the number of values in the TxHashSet.";
const sourceExample =
  'import { Effect, TxHashSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const empty = yield* TxHashSet.empty<string>()\n  console.log(yield* TxHashSet.size(empty)) // 0\n\n  const small = yield* TxHashSet.make("a", "b")\n  console.log(yield* TxHashSet.size(small)) // 2\n\n  const fromIterable = yield* TxHashSet.fromIterable(["x", "y", "z", "x", "y"])\n  console.log(yield* TxHashSet.size(fromIterable)) // 3 (duplicates ignored)\n})';
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
