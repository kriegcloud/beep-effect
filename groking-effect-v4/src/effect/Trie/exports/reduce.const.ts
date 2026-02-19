/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: reduce
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.569Z
 *
 * Overview:
 * Reduce a state over the entries of the `Trie`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 *
 * const trie = Trie.empty<number>().pipe(
 *   Trie.insert("shells", 0),
 *   Trie.insert("sells", 1),
 *   Trie.insert("she", 2)
 * )
 *
 * assert.equal(
 *   trie.pipe(
 *     Trie.reduce(0, (acc, n) => acc + n)
 *   ),
 *   3
 * )
 * assert.equal(
 *   trie.pipe(
 *     Trie.reduce(10, (acc, n) => acc + n)
 *   ),
 *   13
 * )
 * assert.equal(
 *   trie.pipe(
 *     Trie.reduce("", (acc, _, key) => acc + key)
 *   ),
 *   "sellssheshells"
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
const exportName = "reduce";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Reduce a state over the entries of the `Trie`.";
const sourceExample =
  'import * as Trie from "effect/Trie"\nimport * as assert from "node:assert"\n\nconst trie = Trie.empty<number>().pipe(\n  Trie.insert("shells", 0),\n  Trie.insert("sells", 1),\n  Trie.insert("she", 2)\n)\n\nassert.equal(\n  trie.pipe(\n    Trie.reduce(0, (acc, n) => acc + n)\n  ),\n  3\n)\nassert.equal(\n  trie.pipe(\n    Trie.reduce(10, (acc, n) => acc + n)\n  ),\n  13\n)\nassert.equal(\n  trie.pipe(\n    Trie.reduce("", (acc, _, key) => acc + key)\n  ),\n  "sellssheshells"\n)';
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
