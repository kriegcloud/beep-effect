/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: removeMany
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:14:13.825Z
 *
 * Overview:
 * Removes all entries in the `HashMap` which have the specified keys.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2], ["c", 3], ["d", 4])
 * const map2 = HashMap.removeMany(map1, ["b", "d"])
 *
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.has(map2, "a")) // true
 * console.log(HashMap.has(map2, "c")) // true
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
import * as HashMapModule from "effect/HashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "removeMany";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Removes all entries in the `HashMap` which have the specified keys.";
const sourceExample =
  'import * as HashMap from "effect/HashMap"\n\nconst map1 = HashMap.make(["a", 1], ["b", 2], ["c", 3], ["d", 4])\nconst map2 = HashMap.removeMany(map1, ["b", "d"])\n\nconsole.log(HashMap.size(map2)) // 2\nconsole.log(HashMap.has(map2, "a")) // true\nconsole.log(HashMap.has(map2, "c")) // true';
const moduleRecord = HashMapModule as Record<string, unknown>;

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
