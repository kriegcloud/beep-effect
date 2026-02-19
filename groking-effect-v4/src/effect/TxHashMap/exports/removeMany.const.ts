/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: removeMany
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.020Z
 *
 * Overview:
 * Removes multiple keys from the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a cache with temporary data
 *   const cache = yield* TxHashMap.make(
 *     ["session_1", { user: "alice", expires: "2024-01-01" }],
 *     ["session_2", { user: "bob", expires: "2024-01-01" }],
 *     ["session_3", { user: "charlie", expires: "2024-12-31" }],
 *     ["temp_data_1", { value: "temporary" }],
 *     ["temp_data_2", { value: "also_temporary" }]
 *   )
 *
 *   console.log(yield* TxHashMap.size(cache)) // 5
 *
 *   // Remove expired sessions and temporary data
 *   const keysToRemove = ["session_1", "session_2", "temp_data_1", "temp_data_2"]
 *   yield* TxHashMap.removeMany(cache, keysToRemove)
 *
 *   console.log(yield* TxHashMap.size(cache)) // 1
 *
 *   // Verify only the valid session remains
 *   const remainingSession = yield* TxHashMap.get(cache, "session_3")
 *   console.log(remainingSession) // Option.some({ user: "charlie", expires: "2024-12-31" })
 *
 *   // Can also remove from Set, Array, or any iterable
 *   const moreKeysToRemove = new Set(["session_3"])
 *   yield* TxHashMap.removeMany(cache, moreKeysToRemove)
 *   console.log(yield* TxHashMap.isEmpty(cache)) // true
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
const exportName = "removeMany";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Removes multiple keys from the TxHashMap.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a cache with temporary data\n  const cache = yield* TxHashMap.make(\n    ["session_1", { user: "alice", expires: "2024-01-01" }],\n    ["session_2", { user: "bob", expires: "2024-01-01" }],\n    ["session_3", { user: "charlie", expires: "2024-12-31" }],\n    ["temp_data_1", { value: "temporary" }],\n    ["temp_data_2", { value: "also_temporary" }]\n  )\n\n  console.log(yield* TxHashMap.size(cache)) // 5\n\n  // Remove expired sessions and temporary data\n  const keysToRemove = ["session_1", "session_2", "temp_data_1", "temp_data_2"]\n  yield* TxHashMap.removeMany(cache, keysToRemove)\n\n  console.log(yield* TxHashMap.size(cache)) // 1\n\n  // Verify only the valid session remains\n  const remainingSession = yield* TxHashMap.get(cache, "session_3")\n  console.log(remainingSession) // Option.some({ user: "charlie", expires: "2024-12-31" })\n\n  // Can also remove from Set, Array, or any iterable\n  const moreKeysToRemove = new Set(["session_3"])\n  yield* TxHashMap.removeMany(cache, moreKeysToRemove)\n  console.log(yield* TxHashMap.isEmpty(cache)) // true\n})';
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
