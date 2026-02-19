/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: has
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:50:44.147Z
 *
 * Overview:
 * Checks if the TxHashSet contains the specified value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Equal, Hash, TxHashSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const txSet = yield* TxHashSet.make("apple", "banana", "cherry")
 *
 *   console.log(yield* TxHashSet.has(txSet, "apple")) // true
 *   console.log(yield* TxHashSet.has(txSet, "grape")) // false
 *
 *   // Works with any type that implements Equal
 *   class Person implements Equal.Equal {
 *     constructor(readonly name: string) {}
 *
 *     [Equal.symbol](other: unknown) {
 *       return other instanceof Person && this.name === other.name
 *     }
 *
 *     [Hash.symbol](): number {
 *       return Hash.string(this.name)
 *     }
 *   }
 *
 *   const people = yield* TxHashSet.make(new Person("Alice"), new Person("Bob"))
 *   console.log(yield* TxHashSet.has(people, new Person("Alice"))) // true
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
const exportName = "has";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Checks if the TxHashSet contains the specified value.";
const sourceExample =
  'import { Effect, Equal, Hash, TxHashSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const txSet = yield* TxHashSet.make("apple", "banana", "cherry")\n\n  console.log(yield* TxHashSet.has(txSet, "apple")) // true\n  console.log(yield* TxHashSet.has(txSet, "grape")) // false\n\n  // Works with any type that implements Equal\n  class Person implements Equal.Equal {\n    constructor(readonly name: string) {}\n\n    [Equal.symbol](other: unknown) {\n      return other instanceof Person && this.name === other.name\n    }\n\n    [Hash.symbol](): number {\n      return Hash.string(this.name)\n    }\n  }\n\n  const people = yield* TxHashSet.make(new Person("Alice"), new Person("Bob"))\n  console.log(yield* TxHashSet.has(people, new Person("Alice"))) // true\n})';
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
