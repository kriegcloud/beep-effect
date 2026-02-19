/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: reduce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.138Z
 *
 * Overview:
 * Reduces the TxHashSet to a single value by iterating through the values and applying an accumulator function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const numbers = yield* TxHashSet.make(1, 2, 3, 4, 5)
 *   const sum = yield* TxHashSet.reduce(numbers, 0, (acc, n) => acc + n)
 * 
 *   console.log(sum) // 15
 * 
 *   const strings = yield* TxHashSet.make("a", "b", "c")
 *   const concatenated = yield* TxHashSet.reduce(strings, "", (acc, s) => acc + s)
 *   console.log(concatenated) // Order may vary: "abc", "bac", etc.
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
const exportName = "reduce";
const exportKind = "const";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "Reduces the TxHashSet to a single value by iterating through the values and applying an accumulator function.";
const sourceExample = "import { Effect, TxHashSet } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const numbers = yield* TxHashSet.make(1, 2, 3, 4, 5)\n  const sum = yield* TxHashSet.reduce(numbers, 0, (acc, n) => acc + n)\n\n  console.log(sum) // 15\n\n  const strings = yield* TxHashSet.make(\"a\", \"b\", \"c\")\n  const concatenated = yield* TxHashSet.reduce(strings, \"\", (acc, s) => acc + s)\n  console.log(concatenated) // Order may vary: \"abc\", \"bac\", etc.\n})";
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
