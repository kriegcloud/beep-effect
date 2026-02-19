/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: HashSet
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:50:37.079Z
 *
 * Overview:
 * A HashSet is an immutable set data structure that provides efficient storage and retrieval of unique values. It uses a HashMap internally for optimal performance.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * // Create a HashSet
 * const set = HashSet.make("apple", "banana", "cherry")
 *
 * // Check membership
 * console.log(HashSet.has(set, "apple")) // true
 * console.log(HashSet.has(set, "grape")) // false
 *
 * // Add values (returns new HashSet)
 * const updated = HashSet.add(set, "grape")
 * console.log(HashSet.size(updated)) // 4
 *
 * // Remove values (returns new HashSet)
 * const smaller = HashSet.remove(set, "banana")
 * console.log(HashSet.size(smaller)) // 2
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
import * as HashSetModule from "effect/HashSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "HashSet";
const exportKind = "interface";
const moduleImportPath = "effect/HashSet";
const sourceSummary =
  "A HashSet is an immutable set data structure that provides efficient storage and retrieval of unique values. It uses a HashMap internally for optimal performance.";
const sourceExample =
  'import * as HashSet from "effect/HashSet"\n\n// Create a HashSet\nconst set = HashSet.make("apple", "banana", "cherry")\n\n// Check membership\nconsole.log(HashSet.has(set, "apple")) // true\nconsole.log(HashSet.has(set, "grape")) // false\n\n// Add values (returns new HashSet)\nconst updated = HashSet.add(set, "grape")\nconsole.log(HashSet.size(updated)) // 4\n\n// Remove values (returns new HashSet)\nconst smaller = HashSet.remove(set, "banana")\nconsole.log(HashSet.size(smaller)) // 2';
const moduleRecord = HashSetModule as Record<string, unknown>;

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
