/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.138Z
 *
 * Overview:
 * Maps each value in the TxHashSet using the provided function, returning a new TxHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const numbers = yield* TxHashSet.make(1, 2, 3)
 *   const doubled = yield* TxHashSet.map(numbers, (n) => n * 2)
 *
 *   const values = yield* TxHashSet.toHashSet(doubled)
 *   console.log(Array.from(values).sort()) // [2, 4, 6]
 *   console.log(yield* TxHashSet.size(doubled)) // 3
 *
 *   // Mapping can reduce size if function produces duplicates
 *   const strings = yield* TxHashSet.make("apple", "banana", "cherry")
 *   const lengths = yield* TxHashSet.map(strings, (s) => s.length)
 *   const lengthValues = yield* TxHashSet.toHashSet(lengths)
 *   console.log(Array.from(lengthValues).sort()) // [5, 6] (apple=5, banana=6, cherry=6)
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Maps each value in the TxHashSet using the provided function, returning a new TxHashSet.";
const sourceExample =
  'import { Effect, TxHashSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const numbers = yield* TxHashSet.make(1, 2, 3)\n  const doubled = yield* TxHashSet.map(numbers, (n) => n * 2)\n\n  const values = yield* TxHashSet.toHashSet(doubled)\n  console.log(Array.from(values).sort()) // [2, 4, 6]\n  console.log(yield* TxHashSet.size(doubled)) // 3\n\n  // Mapping can reduce size if function produces duplicates\n  const strings = yield* TxHashSet.make("apple", "banana", "cherry")\n  const lengths = yield* TxHashSet.map(strings, (s) => s.length)\n  const lengthValues = yield* TxHashSet.toHashSet(lengths)\n  console.log(Array.from(lengthValues).sort()) // [5, 6] (apple=5, banana=6, cherry=6)\n})';
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
