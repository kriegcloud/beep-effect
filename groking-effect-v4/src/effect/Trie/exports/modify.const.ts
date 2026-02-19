/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.569Z
 *
 * Overview:
 * Updates the value of the specified key within the `Trie` if it exists.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Equal from "effect/Equal"
 * import * as Option from "effect/Option"
 * import * as Trie from "effect/Trie"
 * import * as assert from "node:assert"
 *
 * const trie = Trie.empty<number>().pipe(
 *   Trie.insert("shells", 0),
 *   Trie.insert("sells", 1),
 *   Trie.insert("she", 2)
 * )
 *
 * assert.deepStrictEqual(
 *   trie.pipe(Trie.modify("she", (v) => v + 10), Trie.get("she")),
 *   Option.some(12)
 * )
 *
 * assert.equal(Equal.equals(trie.pipe(Trie.modify("me", (v) => v)), trie), true)
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
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Updates the value of the specified key within the `Trie` if it exists.";
const sourceExample =
  'import * as Equal from "effect/Equal"\nimport * as Option from "effect/Option"\nimport * as Trie from "effect/Trie"\nimport * as assert from "node:assert"\n\nconst trie = Trie.empty<number>().pipe(\n  Trie.insert("shells", 0),\n  Trie.insert("sells", 1),\n  Trie.insert("she", 2)\n)\n\nassert.deepStrictEqual(\n  trie.pipe(Trie.modify("she", (v) => v + 10), Trie.get("she")),\n  Option.some(12)\n)\n\nassert.equal(Equal.equals(trie.pipe(Trie.modify("me", (v) => v)), trie), true)';
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
