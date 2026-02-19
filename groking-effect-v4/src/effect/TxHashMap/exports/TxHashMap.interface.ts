/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: TxHashMap
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.022Z
 *
 * Overview:
 * A TxHashMap is a transactional hash map data structure that provides atomic operations on key-value pairs within Effect transactions. It uses an immutable HashMap internally with TxRef for transactional semantics, ensuring all operations are performed atomically.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a transactional hash map
 *   const txMap = yield* TxHashMap.make(["user1", "Alice"], ["user2", "Bob"])
 *
 *   // Single operations are automatically transactional
 *   yield* TxHashMap.set(txMap, "user3", "Charlie")
 *   const user = yield* TxHashMap.get(txMap, "user1")
 *   console.log(user) // Option.some("Alice")
 *
 *   // Multi-step atomic operations
 *   yield* Effect.atomic(
 *     Effect.gen(function*() {
 *       const currentUser = yield* TxHashMap.get(txMap, "user1")
 *       if (Option.isSome(currentUser)) {
 *         yield* TxHashMap.set(txMap, "user1", currentUser.value + "_updated")
 *         yield* TxHashMap.remove(txMap, "user2")
 *       }
 *     })
 *   )
 *
 *   const size = yield* TxHashMap.size(txMap)
 *   console.log(size) // 2
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TxHashMap";
const exportKind = "interface";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "A TxHashMap is a transactional hash map data structure that provides atomic operations on key-value pairs within Effect transactions. It uses an immutable HashMap internally wit...";
const sourceExample =
  'import { Effect, Option, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a transactional hash map\n  const txMap = yield* TxHashMap.make(["user1", "Alice"], ["user2", "Bob"])\n\n  // Single operations are automatically transactional\n  yield* TxHashMap.set(txMap, "user3", "Charlie")\n  const user = yield* TxHashMap.get(txMap, "user1")\n  console.log(user) // Option.some("Alice")\n\n  // Multi-step atomic operations\n  yield* Effect.atomic(\n    Effect.gen(function*() {\n      const currentUser = yield* TxHashMap.get(txMap, "user1")\n      if (Option.isSome(currentUser)) {\n        yield* TxHashMap.set(txMap, "user1", currentUser.value + "_updated")\n        yield* TxHashMap.remove(txMap, "user2")\n      }\n    })\n  )\n\n  const size = yield* TxHashMap.size(txMap)\n  console.log(size) // 2\n})';
const moduleRecord = TxHashMapModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
