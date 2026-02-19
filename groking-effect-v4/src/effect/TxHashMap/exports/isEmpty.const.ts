/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: isEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Checks if the TxHashMap is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Start with empty map
 *   const cache = yield* TxHashMap.empty<string, any>()
 *   const empty = yield* TxHashMap.isEmpty(cache)
 *   console.log(empty) // true
 *
 *   // Add an item
 *   yield* TxHashMap.set(cache, "key1", "value1")
 *   const stillEmpty = yield* TxHashMap.isEmpty(cache)
 *   console.log(stillEmpty) // false
 *
 *   // Clear and check again
 *   yield* TxHashMap.clear(cache)
 *   const emptyAgain = yield* TxHashMap.isEmpty(cache)
 *   console.log(emptyAgain) // true
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
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isEmpty";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Checks if the TxHashMap is empty.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Start with empty map\n  const cache = yield* TxHashMap.empty<string, any>()\n  const empty = yield* TxHashMap.isEmpty(cache)\n  console.log(empty) // true\n\n  // Add an item\n  yield* TxHashMap.set(cache, "key1", "value1")\n  const stillEmpty = yield* TxHashMap.isEmpty(cache)\n  console.log(stillEmpty) // false\n\n  // Clear and check again\n  yield* TxHashMap.clear(cache)\n  const emptyAgain = yield* TxHashMap.isEmpty(cache)\n  console.log(emptyAgain) // true\n})';
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
