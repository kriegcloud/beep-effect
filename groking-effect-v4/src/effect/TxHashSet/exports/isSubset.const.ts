/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: isSubset
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.138Z
 *
 * Overview:
 * Checks if a TxHashSet is a subset of another TxHashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const small = yield* TxHashSet.make("a", "b")
 *   const large = yield* TxHashSet.make("a", "b", "c", "d")
 *   const other = yield* TxHashSet.make("x", "y")
 * 
 *   console.log(yield* TxHashSet.isSubset(small, large)) // true
 *   console.log(yield* TxHashSet.isSubset(large, small)) // false
 *   console.log(yield* TxHashSet.isSubset(small, other)) // false
 *   console.log(yield* TxHashSet.isSubset(small, small)) // true
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TxHashSetModule from "effect/TxHashSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isSubset";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Checks if a TxHashSet is a subset of another TxHashSet.";
const sourceExample = "import { Effect, TxHashSet } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const small = yield* TxHashSet.make(\"a\", \"b\")\n  const large = yield* TxHashSet.make(\"a\", \"b\", \"c\", \"d\")\n  const other = yield* TxHashSet.make(\"x\", \"y\")\n\n  console.log(yield* TxHashSet.isSubset(small, large)) // true\n  console.log(yield* TxHashSet.isSubset(large, small)) // false\n  console.log(yield* TxHashSet.isSubset(small, other)) // false\n  console.log(yield* TxHashSet.isSubset(small, small)) // true\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
