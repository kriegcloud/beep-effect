/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Updates the value for the specified key if it exists.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const counters = yield* TxHashMap.make(
 *     ["downloads", 100],
 *     ["views", 250]
 *   )
 *
 *   // Increment existing counter
 *   const oldDownloads = yield* TxHashMap.modify(
 *     counters,
 *     "downloads",
 *     (count) => count + 1
 *   )
 *   console.log(oldDownloads) // Option.some(100)
 *
 *   const newDownloads = yield* TxHashMap.get(counters, "downloads")
 *   console.log(newDownloads) // Option.some(101)
 *
 *   // Try to modify non-existent key
 *   const nonExistent = yield* TxHashMap.modify(
 *     counters,
 *     "clicks",
 *     (count) => count + 1
 *   )
 *   console.log(nonExistent) // Option.none()
 *
 *   // Update views counter with direct method call
 *   yield* TxHashMap.modify(counters, "views", (views) => views * 2)
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
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Updates the value for the specified key if it exists.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const counters = yield* TxHashMap.make(\n    ["downloads", 100],\n    ["views", 250]\n  )\n\n  // Increment existing counter\n  const oldDownloads = yield* TxHashMap.modify(\n    counters,\n    "downloads",\n    (count) => count + 1\n  )\n  console.log(oldDownloads) // Option.some(100)\n\n  const newDownloads = yield* TxHashMap.get(counters, "downloads")\n  console.log(newDownloads) // Option.some(101)\n\n  // Try to modify non-existent key\n  const nonExistent = yield* TxHashMap.modify(\n    counters,\n    "clicks",\n    (count) => count + 1\n  )\n  console.log(nonExistent) // Option.none()\n\n  // Update views counter with direct method call\n  yield* TxHashMap.modify(counters, "views", (views) => views * 2)\n})';
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
