/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: entries
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.960Z
 *
 * Overview:
 * Returns an array of all key-value pairs in the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const config = yield* TxHashMap.make(
 *     ["host", "localhost"],
 *     ["port", "3000"],
 *     ["ssl", "false"]
 *   )
 *
 *   const allEntries = yield* TxHashMap.entries(config)
 *   console.log(allEntries)
 *   // [["host", "localhost"], ["port", "3000"], ["ssl", "false"]]
 *
 *   // Process configuration entries
 *   for (const [key, value] of allEntries) {
 *     console.log(`${key}=${value}`)
 *   }
 *   // host=localhost
 *   // port=3000
 *   // ssl=false
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
const exportName = "entries";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Returns an array of all key-value pairs in the TxHashMap.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const config = yield* TxHashMap.make(\n    ["host", "localhost"],\n    ["port", "3000"],\n    ["ssl", "false"]\n  )\n\n  const allEntries = yield* TxHashMap.entries(config)\n  console.log(allEntries)\n  // [["host", "localhost"], ["port", "3000"], ["ssl", "false"]]\n\n  // Process configuration entries\n  for (const [key, value] of allEntries) {\n    console.log(`${key}=${value}`)\n  }\n  // host=localhost\n  // port=3000\n  // ssl=false\n})';
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
