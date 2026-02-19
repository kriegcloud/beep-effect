/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: isTxHashMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.019Z
 *
 * Overview:
 * Returns `true` if the specified value is a `TxHashMap`, `false` otherwise.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const txMap = yield* TxHashMap.make(["key", "value"])
 *
 *   console.log(TxHashMap.isTxHashMap(txMap)) // true
 *   console.log(TxHashMap.isTxHashMap({})) // false
 *   console.log(TxHashMap.isTxHashMap(null)) // false
 *   console.log(TxHashMap.isTxHashMap("not a map")) // false
 *
 *   // Useful for type guards in runtime checks
 *   const validateInput = (value: unknown) => {
 *     if (TxHashMap.isTxHashMap(value)) {
 *       // TypeScript now knows this is a TxHashMap
 *       return Effect.succeed("Valid TxHashMap")
 *     }
 *     return Effect.fail("Invalid input")
 *   }
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
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isTxHashMap";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Returns `true` if the specified value is a `TxHashMap`, `false` otherwise.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const txMap = yield* TxHashMap.make(["key", "value"])\n\n  console.log(TxHashMap.isTxHashMap(txMap)) // true\n  console.log(TxHashMap.isTxHashMap({})) // false\n  console.log(TxHashMap.isTxHashMap(null)) // false\n  console.log(TxHashMap.isTxHashMap("not a map")) // false\n\n  // Useful for type guards in runtime checks\n  const validateInput = (value: unknown) => {\n    if (TxHashMap.isTxHashMap(value)) {\n      // TypeScript now knows this is a TxHashMap\n      return Effect.succeed("Valid TxHashMap")\n    }\n    return Effect.fail("Invalid input")\n  }\n})';
const moduleRecord = TxHashMapModule as Record<string, unknown>;

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
