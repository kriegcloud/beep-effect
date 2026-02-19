/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: add
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Adds a value to the HashSet, returning a new HashSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set = HashSet.make("a", "b")
 * const withC = HashSet.add(set, "c")
 *
 * console.log(HashSet.size(set)) // 2 (original unchanged)
 * console.log(HashSet.size(withC)) // 3
 * console.log(HashSet.has(withC, "c")) // true
 *
 * // Adding existing value has no effect
 * const same = HashSet.add(set, "a")
 * console.log(HashSet.size(same)) // 2
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
import * as HashSetModule from "effect/HashSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "add";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Adds a value to the HashSet, returning a new HashSet.";
const sourceExample =
  'import * as HashSet from "effect/HashSet"\n\nconst set = HashSet.make("a", "b")\nconst withC = HashSet.add(set, "c")\n\nconsole.log(HashSet.size(set)) // 2 (original unchanged)\nconsole.log(HashSet.size(withC)) // 3\nconsole.log(HashSet.has(withC, "c")) // true\n\n// Adding existing value has no effect\nconst same = HashSet.add(set, "a")\nconsole.log(HashSet.size(same)) // 2';
const moduleRecord = HashSetModule as Record<string, unknown>;

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
