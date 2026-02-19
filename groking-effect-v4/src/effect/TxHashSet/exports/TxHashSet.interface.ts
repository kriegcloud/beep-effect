/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashSet
 * Export: TxHashSet
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/TxHashSet.ts
 * Generated: 2026-02-19T04:14:23.138Z
 *
 * Overview:
 * A TxHashSet is a transactional hash set data structure that provides atomic operations on unique values within Effect transactions. It uses an immutable HashSet internally with TxRef for transactional semantics, ensuring all operations are performed atomically.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashSet } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a transactional hash set
 *   const txSet = yield* TxHashSet.make("apple", "banana", "cherry")
 * 
 *   // Single operations are automatically transactional
 *   yield* TxHashSet.add(txSet, "grape")
 *   const hasApple = yield* TxHashSet.has(txSet, "apple")
 *   console.log(hasApple) // true
 * 
 *   // Multi-step atomic operations
 *   yield* Effect.atomic(
 *     Effect.gen(function*() {
 *       const hasCherry = yield* TxHashSet.has(txSet, "cherry")
 *       if (hasCherry) {
 *         yield* TxHashSet.remove(txSet, "cherry")
 *         yield* TxHashSet.add(txSet, "orange")
 *       }
 *     })
 *   )
 * 
 *   const size = yield* TxHashSet.size(txSet)
 *   console.log(size) // 4
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TxHashSetModule from "effect/TxHashSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TxHashSet";
const exportKind = "interface";
const moduleImportPath = "effect/TxHashSet";
const sourceSummary = "A TxHashSet is a transactional hash set data structure that provides atomic operations on unique values within Effect transactions. It uses an immutable HashSet internally with ...";
const sourceExample = "import { Effect, TxHashSet } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create a transactional hash set\n  const txSet = yield* TxHashSet.make(\"apple\", \"banana\", \"cherry\")\n\n  // Single operations are automatically transactional\n  yield* TxHashSet.add(txSet, \"grape\")\n  const hasApple = yield* TxHashSet.has(txSet, \"apple\")\n  console.log(hasApple) // true\n\n  // Multi-step atomic operations\n  yield* Effect.atomic(\n    Effect.gen(function*() {\n      const hasCherry = yield* TxHashSet.has(txSet, \"cherry\")\n      if (hasCherry) {\n        yield* TxHashSet.remove(txSet, \"cherry\")\n        yield* TxHashSet.add(txSet, \"orange\")\n      }\n    })\n  )\n\n  const size = yield* TxHashSet.size(txSet)\n  console.log(size) // 4\n})";
const moduleRecord = TxHashSetModule as Record<string, unknown>;

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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
