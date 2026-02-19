/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashMap
 * Export: endMutation
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashMap.ts
 * Generated: 2026-02-19T04:50:36.919Z
 *
 * Overview:
 * Marks the `HashMap` as immutable, completing the mutation cycle.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * // Start with an existing map
 * const original = HashMap.make(["x", 10], ["y", 20])
 *
 * // Begin mutation for batch operations
 * const mutable = HashMap.beginMutation(original)
 *
 * // Perform multiple efficient operations
 * HashMap.set(mutable, "z", 30)
 * HashMap.remove(mutable, "x")
 * HashMap.set(mutable, "w", 40)
 *
 * // End mutation to get final immutable result
 * const final = HashMap.endMutation(mutable)
 *
 * console.log(HashMap.size(final)) // 3
 * console.log(HashMap.has(final, "x")) // false
 * console.log(HashMap.get(final, "z")) // Option.some(30)
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
import * as HashMapModule from "effect/HashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "endMutation";
const exportKind = "const";
const moduleImportPath = "effect/HashMap";
const sourceSummary = "Marks the `HashMap` as immutable, completing the mutation cycle.";
const sourceExample =
  'import * as HashMap from "effect/HashMap"\n\n// Start with an existing map\nconst original = HashMap.make(["x", 10], ["y", 20])\n\n// Begin mutation for batch operations\nconst mutable = HashMap.beginMutation(original)\n\n// Perform multiple efficient operations\nHashMap.set(mutable, "z", 30)\nHashMap.remove(mutable, "x")\nHashMap.set(mutable, "w", 40)\n\n// End mutation to get final immutable result\nconst final = HashMap.endMutation(mutable)\n\nconsole.log(HashMap.size(final)) // 3\nconsole.log(HashMap.has(final, "x")) // false\nconsole.log(HashMap.get(final, "z")) // Option.some(30)';
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
