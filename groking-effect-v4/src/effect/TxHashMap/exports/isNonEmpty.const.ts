/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: isNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Checks if the TxHashMap is non-empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const inventory = yield* TxHashMap.make(["laptop", 5])
 * 
 *   const hasItems = yield* TxHashMap.isNonEmpty(inventory)
 *   console.log(hasItems) // true
 * 
 *   // Clear inventory
 *   yield* TxHashMap.clear(inventory)
 *   const stillHasItems = yield* TxHashMap.isNonEmpty(inventory)
 *   console.log(stillHasItems) // false
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
import * as TxHashMapModule from "effect/TxHashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Checks if the TxHashMap is non-empty.";
const sourceExample = "import { Effect, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const inventory = yield* TxHashMap.make([\"laptop\", 5])\n\n  const hasItems = yield* TxHashMap.isNonEmpty(inventory)\n  console.log(hasItems) // true\n\n  // Clear inventory\n  yield* TxHashMap.clear(inventory)\n  const stillHasItems = yield* TxHashMap.isNonEmpty(inventory)\n  console.log(stillHasItems) // false\n})";
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
