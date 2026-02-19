/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Trie
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Trie.ts
 * Generated: 2026-02-19T04:14:22.568Z
 *
 * Overview:
 * Safely lookup the value for the specified key in the `Trie`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Option from "effect/Option"
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
 * assert.deepStrictEqual(Trie.get(trie, "call"), Option.some(0))
 * assert.deepStrictEqual(Trie.get(trie, "me"), Option.some(1))
 * assert.deepStrictEqual(Trie.get(trie, "mind"), Option.some(2))
 * assert.deepStrictEqual(Trie.get(trie, "mid"), Option.some(3))
 * assert.deepStrictEqual(Trie.get(trie, "cale"), Option.none())
 * assert.deepStrictEqual(Trie.get(trie, "ma"), Option.none())
 * assert.deepStrictEqual(Trie.get(trie, "midn"), Option.none())
 * assert.deepStrictEqual(Trie.get(trie, "mea"), Option.none())
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
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/Trie";
const sourceSummary = "Safely lookup the value for the specified key in the `Trie`.";
const sourceExample = "import * as Option from \"effect/Option\"\nimport * as Trie from \"effect/Trie\"\nimport * as assert from \"node:assert\"\n\nconst trie = Trie.empty<number>().pipe(\n  Trie.insert(\"call\", 0),\n  Trie.insert(\"me\", 1),\n  Trie.insert(\"mind\", 2),\n  Trie.insert(\"mid\", 3)\n)\n\nassert.deepStrictEqual(Trie.get(trie, \"call\"), Option.some(0))\nassert.deepStrictEqual(Trie.get(trie, \"me\"), Option.some(1))\nassert.deepStrictEqual(Trie.get(trie, \"mind\"), Option.some(2))\nassert.deepStrictEqual(Trie.get(trie, \"mid\"), Option.some(3))\nassert.deepStrictEqual(Trie.get(trie, \"cale\"), Option.none())\nassert.deepStrictEqual(Trie.get(trie, \"ma\"), Option.none())\nassert.deepStrictEqual(Trie.get(trie, \"midn\"), Option.none())\nassert.deepStrictEqual(Trie.get(trie, \"mea\"), Option.none())";
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
