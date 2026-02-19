/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.568Z
 *
 * Overview:
 * Filters entries out of a `Trie` using the specified predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Equal from "effect/Equal"
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 * 
 * const trie = Trie.empty<number>().pipe(
 *   Trie.insert("shells", 0),
 *   Trie.insert("sells", 1),
 *   Trie.insert("she", 2)
 * )
 * 
 * const trieMapV = Trie.empty<number>().pipe(
 *   Trie.insert("she", 2)
 * )
 * 
 * const trieMapK = Trie.empty<number>().pipe(
 *   Trie.insert("shells", 0),
 *   Trie.insert("sells", 1)
 * )
 * 
 * assert.equal(Equal.equals(Trie.filter(trie, (v) => v > 1), trieMapV), true)
 * assert.equal(
 *   Equal.equals(Trie.filter(trie, (_, k) => k.length > 3), trieMapK),
 *   true
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TrieModule from "effect/Trie";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Filters entries out of a `Trie` using the specified predicate.";
const sourceExample = "import * as Equal from \"effect/Equal\"\nimport * as Trie from \"effect/Trie\"\nimport * as assert from \"node:assert\"\n\nconst trie = Trie.empty<number>().pipe(\n  Trie.insert(\"shells\", 0),\n  Trie.insert(\"sells\", 1),\n  Trie.insert(\"she\", 2)\n)\n\nconst trieMapV = Trie.empty<number>().pipe(\n  Trie.insert(\"she\", 2)\n)\n\nconst trieMapK = Trie.empty<number>().pipe(\n  Trie.insert(\"shells\", 0),\n  Trie.insert(\"sells\", 1)\n)\n\nassert.equal(Equal.equals(Trie.filter(trie, (v) => v > 1), trieMapV), true)\nassert.equal(\n  Equal.equals(Trie.filter(trie, (_, k) => k.length > 3), trieMapK),\n  true\n)";
const moduleRecord = TrieModule as Record<string, unknown>;

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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
