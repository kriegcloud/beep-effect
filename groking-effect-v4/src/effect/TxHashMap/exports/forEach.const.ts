/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: forEach
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.016Z
 *
 * Overview:
 * Executes a side-effect function for each entry in the TxHashMap. The function receives the value and key as parameters and can perform effects.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a log processing map
 *   const logs = yield* TxHashMap.make(
 *     ["error.log", { size: 1024, level: "error" }],
 *     ["access.log", { size: 2048, level: "info" }],
 *     ["debug.log", { size: 512, level: "debug" }]
 *   )
 *
 *   // Process each log file with side effects
 *   yield* TxHashMap.forEach(logs, (logInfo, filename) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(
 *         `Processing ${filename}: ${logInfo.size} bytes, level: ${logInfo.level}`
 *       )
 *       if (logInfo.level === "error") {
 *         yield* Console.log(`⚠️  Error log detected: ${filename}`)
 *       }
 *     }))
 *
 *   // Data-last usage with pipe
 *   yield* logs.pipe(
 *     TxHashMap.forEach((logInfo) =>
 *       logInfo.size > 1000
 *         ? Console.log(`Large log file: ${logInfo.size} bytes`)
 *         : Effect.void
 *     )
 *   )
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
const exportName = "forEach";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "Executes a side-effect function for each entry in the TxHashMap. The function receives the value and key as parameters and can perform effects.";
const sourceExample =
  'import { Console, Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a log processing map\n  const logs = yield* TxHashMap.make(\n    ["error.log", { size: 1024, level: "error" }],\n    ["access.log", { size: 2048, level: "info" }],\n    ["debug.log", { size: 512, level: "debug" }]\n  )\n\n  // Process each log file with side effects\n  yield* TxHashMap.forEach(logs, (logInfo, filename) =>\n    Effect.gen(function*() {\n      yield* Console.log(\n        `Processing ${filename}: ${logInfo.size} bytes, level: ${logInfo.level}`\n      )\n      if (logInfo.level === "error") {\n        yield* Console.log(`⚠️  Error log detected: ${filename}`)\n      }\n    }))\n\n  // Data-last usage with pipe\n  yield* logs.pipe(\n    TxHashMap.forEach((logInfo) =>\n      logInfo.size > 1000\n        ? Console.log(`Large log file: ${logInfo.size} bytes`)\n        : Effect.void\n    )\n  )\n})';
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
