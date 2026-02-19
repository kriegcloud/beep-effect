/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: isEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.568Z
 *
 * Overview:
 * Checks if the `Trie` contains any entries.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 * 
 * const trie = Trie.empty<number>()
 * const trie1 = trie.pipe(Trie.insert("ma", 0))
 * 
 * assert.equal(Trie.isEmpty(trie), true)
 * assert.equal(Trie.isEmpty(trie1), false)
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
const exportName = "isEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Checks if the `Trie` contains any entries.";
const sourceExample = "import * as Trie from \"effect/Trie\"\nimport * as assert from \"node:assert\"\n\nconst trie = Trie.empty<number>()\nconst trie1 = trie.pipe(Trie.insert(\"ma\", 0))\n\nassert.equal(Trie.isEmpty(trie), true)\nassert.equal(Trie.isEmpty(trie1), false)";
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
