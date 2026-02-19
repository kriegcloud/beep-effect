/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: entriesWithPrefix
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.568Z
 *
 * Overview:
 * Returns an `IterableIterator` of the entries within the `Trie` that have `prefix` as prefix (`prefix` included if it exists).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 *
 * const trie = Trie.empty<number>().pipe(
 *   Trie.insert("she", 0),
 *   Trie.insert("shells", 1),
 *   Trie.insert("sea", 2),
 *   Trie.insert("shore", 3)
 * )
 *
 * const result = Array.from(Trie.entriesWithPrefix(trie, "she"))
 * assert.deepStrictEqual(result, [["she", 0], ["shells", 1]])
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TrieModule from "effect/Trie";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "entriesWithPrefix";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary =
  "Returns an `IterableIterator` of the entries within the `Trie` that have `prefix` as prefix (`prefix` included if it exists).";
const sourceExample =
  'import * as Trie from "effect/Trie"\nimport * as assert from "node:assert"\n\nconst trie = Trie.empty<number>().pipe(\n  Trie.insert("she", 0),\n  Trie.insert("shells", 1),\n  Trie.insert("sea", 2),\n  Trie.insert("shore", 3)\n)\n\nconst result = Array.from(Trie.entriesWithPrefix(trie, "she"))\nassert.deepStrictEqual(result, [["she", 0], ["shells", 1]])';
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
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
