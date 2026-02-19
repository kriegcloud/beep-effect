/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: toEntries
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.020Z
 *
 * Overview:
 * Returns an array of all key-value pairs in the TxHashMap. This is an alias for the `entries` function, providing API consistency with HashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const settings = yield* TxHashMap.make(
 *     ["theme", "dark"],
 *     ["language", "en-US"],
 *     ["timezone", "UTC"]
 *   )
 *
 *   // Get all entries as an array
 *   const allEntries = yield* TxHashMap.toEntries(settings)
 *   console.log(allEntries)
 *   // [["theme", "dark"], ["language", "en-US"], ["timezone", "UTC"]]
 *
 *   // Process entries
 *   for (const [setting, value] of allEntries) {
 *     console.log(`${setting}: ${value}`)
 *   }
 *
 *   // Convert to object for JSON serialization
 *   const settingsObj = Object.fromEntries(allEntries)
 *   console.log(JSON.stringify(settingsObj))
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
const exportName = "toEntries";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "Returns an array of all key-value pairs in the TxHashMap. This is an alias for the `entries` function, providing API consistency with HashMap.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const settings = yield* TxHashMap.make(\n    ["theme", "dark"],\n    ["language", "en-US"],\n    ["timezone", "UTC"]\n  )\n\n  // Get all entries as an array\n  const allEntries = yield* TxHashMap.toEntries(settings)\n  console.log(allEntries)\n  // [["theme", "dark"], ["language", "en-US"], ["timezone", "UTC"]]\n\n  // Process entries\n  for (const [setting, value] of allEntries) {\n    console.log(`${setting}: ${value}`)\n  }\n\n  // Convert to object for JSON serialization\n  const settingsObj = Object.fromEntries(allEntries)\n  console.log(JSON.stringify(settingsObj))\n})';
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
