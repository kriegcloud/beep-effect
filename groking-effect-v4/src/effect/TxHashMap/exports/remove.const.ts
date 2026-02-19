/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: remove
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.962Z
 *
 * Overview:
 * Removes the specified key from the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* TxHashMap.make(
 *     ["user:1", { name: "Alice", lastSeen: "2024-01-01" }],
 *     ["user:2", { name: "Bob", lastSeen: "2024-01-02" }],
 *     ["user:3", { name: "Charlie", lastSeen: "2023-12-30" }]
 *   )
 *
 *   // Remove expired user
 *   const removed = yield* TxHashMap.remove(cache, "user:3")
 *   console.log(removed) // true (key existed and was removed)
 *
 *   // Try to remove non-existent key
 *   const notRemoved = yield* TxHashMap.remove(cache, "user:999")
 *   console.log(notRemoved) // false (key didn't exist)
 *
 *   // Verify removal
 *   const hasUser3 = yield* TxHashMap.has(cache, "user:3")
 *   console.log(hasUser3) // false
 *
 *   const size = yield* TxHashMap.size(cache)
 *   console.log(size) // 2
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
const exportName = "remove";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Removes the specified key from the TxHashMap.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const cache = yield* TxHashMap.make(\n    ["user:1", { name: "Alice", lastSeen: "2024-01-01" }],\n    ["user:2", { name: "Bob", lastSeen: "2024-01-02" }],\n    ["user:3", { name: "Charlie", lastSeen: "2023-12-30" }]\n  )\n\n  // Remove expired user\n  const removed = yield* TxHashMap.remove(cache, "user:3")\n  console.log(removed) // true (key existed and was removed)\n\n  // Try to remove non-existent key\n  const notRemoved = yield* TxHashMap.remove(cache, "user:999")\n  console.log(notRemoved) // false (key didn\'t exist)\n\n  // Verify removal\n  const hasUser3 = yield* TxHashMap.has(cache, "user:3")\n  console.log(hasUser3) // false\n\n  const size = yield* TxHashMap.size(cache)\n  console.log(size) // 2\n})';
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
