/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: has
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:50:43.510Z
 *
 * Overview:
 * Check if the given key exists in the `Trie`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 *
 * const trie = Trie.empty<number>().pipe(
 *   Trie.insert("call", 0),
 *   Trie.insert("me", 1),
 *   Trie.insert("mind", 2),
 *   Trie.insert("mid", 3)
 * )
 *
 * assert.equal(Trie.has(trie, "call"), true)
 * assert.equal(Trie.has(trie, "me"), true)
 * assert.equal(Trie.has(trie, "mind"), true)
 * assert.equal(Trie.has(trie, "mid"), true)
 * assert.equal(Trie.has(trie, "cale"), false)
 * assert.equal(Trie.has(trie, "ma"), false)
 * assert.equal(Trie.has(trie, "midn"), false)
 * assert.equal(Trie.has(trie, "mea"), false)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TrieModule from "effect/Trie";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "has";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Check if the given key exists in the `Trie`.";
const sourceExample =
  'import * as Trie from "effect/Trie"\nimport * as assert from "node:assert"\n\nconst trie = Trie.empty<number>().pipe(\n  Trie.insert("call", 0),\n  Trie.insert("me", 1),\n  Trie.insert("mind", 2),\n  Trie.insert("mid", 3)\n)\n\nassert.equal(Trie.has(trie, "call"), true)\nassert.equal(Trie.has(trie, "me"), true)\nassert.equal(Trie.has(trie, "mind"), true)\nassert.equal(Trie.has(trie, "mid"), true)\nassert.equal(Trie.has(trie, "cale"), false)\nassert.equal(Trie.has(trie, "ma"), false)\nassert.equal(Trie.has(trie, "midn"), false)\nassert.equal(Trie.has(trie, "mea"), false)';
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
