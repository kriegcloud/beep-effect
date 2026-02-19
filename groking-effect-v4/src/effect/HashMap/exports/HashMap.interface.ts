/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: HashMap
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.824Z
 *
 * Overview:
 * A HashMap is an immutable key-value data structure that provides efficient lookup, insertion, and deletion operations. It uses a Hash Array Mapped Trie (HAMT) internally for structural sharing and optimal performance.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * 
 * // Create a HashMap
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 * 
 * // Access values
 * const valueA = HashMap.get(map, "a") // Option.some(1)
 * const valueD = HashMap.get(map, "d") // Option.none()
 * 
 * // Check if key exists
 * console.log(HashMap.has(map, "b")) // true
 * 
 * // Add/update values (returns new HashMap)
 * const updated = HashMap.set(map, "d", 4)
 * console.log(HashMap.size(updated)) // 4
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
import * as HashMapModule from "effect/HashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "HashMap";
const exportKind = "interface";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "A HashMap is an immutable key-value data structure that provides efficient lookup, insertion, and deletion operations. It uses a Hash Array Mapped Trie (HAMT) internally for str...";
const sourceExample = "import * as HashMap from \"effect/HashMap\"\n\n// Create a HashMap\nconst map = HashMap.make([\"a\", 1], [\"b\", 2], [\"c\", 3])\n\n// Access values\nconst valueA = HashMap.get(map, \"a\") // Option.some(1)\nconst valueD = HashMap.get(map, \"d\") // Option.none()\n\n// Check if key exists\nconsole.log(HashMap.has(map, \"b\")) // true\n\n// Add/update values (returns new HashMap)\nconst updated = HashMap.set(map, \"d\", 4)\nconsole.log(HashMap.size(updated)) // 4";
const moduleRecord = HashMapModule as Record<string, unknown>;

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
