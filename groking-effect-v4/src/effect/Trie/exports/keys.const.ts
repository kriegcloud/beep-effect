/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: keys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.568Z
 *
 * Overview:
 * Returns an `IterableIterator` of the keys within the `Trie`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 * 
 * const trie = Trie.empty<number>().pipe(
 *   Trie.insert("cab", 0),
 *   Trie.insert("abc", 1),
 *   Trie.insert("bca", 2)
 * )
 * 
 * const result = Array.from(Trie.keys(trie))
 * assert.deepStrictEqual(result, ["abc", "bca", "cab"])
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
const exportName = "keys";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Returns an `IterableIterator` of the keys within the `Trie`.";
const sourceExample = "import * as Trie from \"effect/Trie\"\nimport * as assert from \"node:assert\"\n\nconst trie = Trie.empty<number>().pipe(\n  Trie.insert(\"cab\", 0),\n  Trie.insert(\"abc\", 1),\n  Trie.insert(\"bca\", 2)\n)\n\nconst result = Array.from(Trie.keys(trie))\nassert.deepStrictEqual(result, [\"abc\", \"bca\", \"cab\"])";
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
