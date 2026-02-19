/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: insert
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.568Z
 *
 * Overview:
 * Insert a new entry in the `Trie`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 * 
 * const trie1 = Trie.empty<number>().pipe(
 *   Trie.insert("call", 0)
 * )
 * const trie2 = trie1.pipe(Trie.insert("me", 1))
 * const trie3 = trie2.pipe(Trie.insert("mind", 2))
 * const trie4 = trie3.pipe(Trie.insert("mid", 3))
 * 
 * assert.deepStrictEqual(Array.from(trie1), [["call", 0]])
 * assert.deepStrictEqual(Array.from(trie2), [["call", 0], ["me", 1]])
 * assert.deepStrictEqual(Array.from(trie3), [["call", 0], ["me", 1], ["mind", 2]])
 * assert.deepStrictEqual(Array.from(trie4), [["call", 0], ["me", 1], ["mid", 3], [
 *   "mind",
 *   2
 * ]])
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
const exportName = "insert";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Insert a new entry in the `Trie`.";
const sourceExample = "import * as Trie from \"effect/Trie\"\nimport * as assert from \"node:assert\"\n\nconst trie1 = Trie.empty<number>().pipe(\n  Trie.insert(\"call\", 0)\n)\nconst trie2 = trie1.pipe(Trie.insert(\"me\", 1))\nconst trie3 = trie2.pipe(Trie.insert(\"mind\", 2))\nconst trie4 = trie3.pipe(Trie.insert(\"mid\", 3))\n\nassert.deepStrictEqual(Array.from(trie1), [[\"call\", 0]])\nassert.deepStrictEqual(Array.from(trie2), [[\"call\", 0], [\"me\", 1]])\nassert.deepStrictEqual(Array.from(trie3), [[\"call\", 0], [\"me\", 1], [\"mind\", 2]])\nassert.deepStrictEqual(Array.from(trie4), [[\"call\", 0], [\"me\", 1], [\"mid\", 3], [\n  \"mind\",\n  2\n]])";
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
