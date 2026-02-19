/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: Trie
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.569Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Trie from "effect/Trie"
 * 
 * // Create a trie with string-to-number mappings
 * const trie: Trie.Trie<number> = Trie.make(
 *   ["apple", 1],
 *   ["app", 2],
 *   ["application", 3],
 *   ["banana", 4]
 * )
 * 
 * // Get values by exact key
 * console.log(Trie.get(trie, "apple")) // Some(1)
 * console.log(Trie.get(trie, "grape")) // None
 * 
 * // Find all keys with a prefix
 * console.log(Array.from(Trie.keysWithPrefix(trie, "app")))
 * // ["app", "apple", "application"]
 * 
 * // Iterate over all entries (sorted alphabetically)
 * for (const [key, value] of trie) {
 *   console.log(`${key}: ${value}`)
 * }
 * // Output: "app: 2", "apple: 1", "application: 3", "banana: 4"
 * 
 * // Check if key exists
 * console.log(Trie.has(trie, "app")) // true
 * 
 * // Get size
 * console.log(Trie.size(trie)) // 4
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
import * as TrieModule from "effect/Trie";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Trie";
const exportKind = "interface";
const moduleImportPath = "effect/Trie";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import * as Trie from \"effect/Trie\"\n\n// Create a trie with string-to-number mappings\nconst trie: Trie.Trie<number> = Trie.make(\n  [\"apple\", 1],\n  [\"app\", 2],\n  [\"application\", 3],\n  [\"banana\", 4]\n)\n\n// Get values by exact key\nconsole.log(Trie.get(trie, \"apple\")) // Some(1)\nconsole.log(Trie.get(trie, \"grape\")) // None\n\n// Find all keys with a prefix\nconsole.log(Array.from(Trie.keysWithPrefix(trie, \"app\")))\n// [\"app\", \"apple\", \"application\"]\n\n// Iterate over all entries (sorted alphabetically)\nfor (const [key, value] of trie) {\n  console.log(`${key}: ${value}`)\n}\n// Output: \"app: 2\", \"apple: 1\", \"application: 3\", \"banana: 4\"\n\n// Check if key exists\nconsole.log(Trie.has(trie, \"app\")) // true\n\n// Get size\nconsole.log(Trie.size(trie)) // 4";
const moduleRecord = TrieModule as Record<string, unknown>;

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
