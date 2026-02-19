/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: prepend
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:50:37.846Z
 *
 * Overview:
 * Prepends an element to the beginning of the MutableList. This operation is optimized for high-frequency usage.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<string>()
 *
 * // Prepend elements (they'll be at the front)
 * MutableList.prepend(list, "third")
 * MutableList.prepend(list, "second")
 * MutableList.prepend(list, "first")
 *
 * console.log(list.length) // 3
 *
 * // Elements taken from head (most recently prepended first)
 * console.log(MutableList.take(list)) // "first"
 * console.log(MutableList.take(list)) // "second"
 * console.log(MutableList.take(list)) // "third"
 *
 * // Use case: priority items or stack-like behavior
 * MutableList.append(list, "normal")
 * MutableList.prepend(list, "priority") // This will be taken first
 * console.log(MutableList.take(list)) // "priority"
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
import * as MutableListModule from "effect/MutableList";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "prepend";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Prepends an element to the beginning of the MutableList. This operation is optimized for high-frequency usage.";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<string>()\n\n// Prepend elements (they\'ll be at the front)\nMutableList.prepend(list, "third")\nMutableList.prepend(list, "second")\nMutableList.prepend(list, "first")\n\nconsole.log(list.length) // 3\n\n// Elements taken from head (most recently prepended first)\nconsole.log(MutableList.take(list)) // "first"\nconsole.log(MutableList.take(list)) // "second"\nconsole.log(MutableList.take(list)) // "third"\n\n// Use case: priority items or stack-like behavior\nMutableList.append(list, "normal")\nMutableList.prepend(list, "priority") // This will be taken first\nconsole.log(MutableList.take(list)) // "priority"';
const moduleRecord = MutableListModule as Record<string, unknown>;

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
