/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.568Z
 *
 * Overview:
 * Creates a new `Trie` from an iterable collection of key/value pairs (e.g. `Array<[string, V]>`).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Equal from "effect/Equal"
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 *
 * const iterable: Array<readonly [string, number]> = [["call", 0], ["me", 1], [
 *   "mind",
 *   2
 * ], ["mid", 3]]
 * const trie = Trie.fromIterable(iterable)
 *
 * // The entries in the `Trie` are extracted in alphabetical order, regardless of the insertion order
 * assert.deepStrictEqual(Array.from(trie), [["call", 0], ["me", 1], ["mid", 3], [
 *   "mind",
 *   2
 * ]])
 * assert.equal(
 *   Equal.equals(
 *     Trie.make(["call", 0], ["me", 1], ["mind", 2], ["mid", 3]),
 *     trie
 *   ),
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
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary =
  "Creates a new `Trie` from an iterable collection of key/value pairs (e.g. `Array<[string, V]>`).";
const sourceExample =
  'import * as Equal from "effect/Equal"\nimport * as Trie from "effect/Trie"\nimport * as assert from "node:assert"\n\nconst iterable: Array<readonly [string, number]> = [["call", 0], ["me", 1], [\n  "mind",\n  2\n], ["mid", 3]]\nconst trie = Trie.fromIterable(iterable)\n\n// The entries in the `Trie` are extracted in alphabetical order, regardless of the insertion order\nassert.deepStrictEqual(Array.from(trie), [["call", 0], ["me", 1], ["mid", 3], [\n  "mind",\n  2\n]])\nassert.equal(\n  Equal.equals(\n    Trie.make(["call", 0], ["me", 1], ["mind", 2], ["mid", 3]),\n    trie\n  ),\n  true\n)';
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
