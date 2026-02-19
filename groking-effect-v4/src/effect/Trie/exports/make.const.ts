/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.568Z
 *
 * Overview:
 * Constructs a new `Trie` from the specified entries (`[string, V]`).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Equal from "effect/Equal"
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 *
 * const trie = Trie.make(["ca", 0], ["me", 1])
 *
 * assert.deepStrictEqual(Array.from(trie), [["ca", 0], ["me", 1]])
 * assert.equal(
 *   Equal.equals(Trie.fromIterable([["ca", 0], ["me", 1]]), trie),
 *   true
 * )
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Constructs a new `Trie` from the specified entries (`[string, V]`).";
const sourceExample =
  'import * as Equal from "effect/Equal"\nimport * as Trie from "effect/Trie"\nimport * as assert from "node:assert"\n\nconst trie = Trie.make(["ca", 0], ["me", 1])\n\nassert.deepStrictEqual(Array.from(trie), [["ca", 0], ["me", 1]])\nassert.equal(\n  Equal.equals(Trie.fromIterable([["ca", 0], ["me", 1]]), trie),\n  true\n)';
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
