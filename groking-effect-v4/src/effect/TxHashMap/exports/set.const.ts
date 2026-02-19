/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: set
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.962Z
 *
 * Overview:
 * Sets the value for the specified key in the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const inventory = yield* TxHashMap.make(
 *     ["laptop", 5],
 *     ["mouse", 20]
 *   )
 *
 *   // Update existing item
 *   yield* TxHashMap.set(inventory, "laptop", 3)
 *   const laptopStock = yield* TxHashMap.get(inventory, "laptop")
 *   console.log(laptopStock) // Option.some(3)
 *
 *   // Add new item
 *   yield* TxHashMap.set(inventory, "keyboard", 15)
 *   const keyboardStock = yield* TxHashMap.get(inventory, "keyboard")
 *   console.log(keyboardStock) // Option.some(15)
 *
 *   // Use with pipe syntax
 *   yield* TxHashMap.set("tablet", 8)(inventory)
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
const exportName = "set";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Sets the value for the specified key in the TxHashMap.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const inventory = yield* TxHashMap.make(\n    ["laptop", 5],\n    ["mouse", 20]\n  )\n\n  // Update existing item\n  yield* TxHashMap.set(inventory, "laptop", 3)\n  const laptopStock = yield* TxHashMap.get(inventory, "laptop")\n  console.log(laptopStock) // Option.some(3)\n\n  // Add new item\n  yield* TxHashMap.set(inventory, "keyboard", 15)\n  const keyboardStock = yield* TxHashMap.get(inventory, "keyboard")\n  console.log(keyboardStock) // Option.some(15)\n\n  // Use with pipe syntax\n  yield* TxHashMap.set("tablet", 8)(inventory)\n})';
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
