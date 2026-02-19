/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableHashSet
 * Export: MutableHashSet
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/MutableHashSet.ts
 * Generated: 2026-02-19T04:14:15.152Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableHashSet } from "effect"
 * 
 * // Create a mutable hash set
 * const set: MutableHashSet.MutableHashSet<string> = MutableHashSet.make(
 *   "apple",
 *   "banana"
 * )
 * 
 * // Add elements
 * MutableHashSet.add(set, "cherry")
 * 
 * // Check if elements exist
 * console.log(MutableHashSet.has(set, "apple")) // true
 * console.log(MutableHashSet.has(set, "grape")) // false
 * 
 * // Iterate over elements
 * for (const value of set) {
 *   console.log(value) // "apple", "banana", "cherry"
 * }
 * 
 * // Get size
 * console.log(MutableHashSet.size(set)) // 3
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
import * as MutableHashSetModule from "effect/MutableHashSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MutableHashSet";
const exportKind = "interface";
const moduleImportPath = "effect/MutableHashSet";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { MutableHashSet } from \"effect\"\n\n// Create a mutable hash set\nconst set: MutableHashSet.MutableHashSet<string> = MutableHashSet.make(\n  \"apple\",\n  \"banana\"\n)\n\n// Add elements\nMutableHashSet.add(set, \"cherry\")\n\n// Check if elements exist\nconsole.log(MutableHashSet.has(set, \"apple\")) // true\nconsole.log(MutableHashSet.has(set, \"grape\")) // false\n\n// Iterate over elements\nfor (const value of set) {\n  console.log(value) // \"apple\", \"banana\", \"cherry\"\n}\n\n// Get size\nconsole.log(MutableHashSet.size(set)) // 3";
const moduleRecord = MutableHashSetModule as Record<string, unknown>;

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
