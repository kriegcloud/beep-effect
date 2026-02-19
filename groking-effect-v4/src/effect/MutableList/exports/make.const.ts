/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * Creates an empty MutableList.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<string>()
 *
 * // Add elements
 * MutableList.append(list, "first")
 * MutableList.append(list, "second")
 * MutableList.prepend(list, "beginning")
 *
 * console.log(list.length) // 3
 *
 * // Take elements in FIFO order (from head)
 * console.log(MutableList.take(list)) // "beginning"
 * console.log(MutableList.take(list)) // "first"
 * console.log(MutableList.take(list)) // "second"
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
import * as MutableListModule from "effect/MutableList";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary = "Creates an empty MutableList.";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<string>()\n\n// Add elements\nMutableList.append(list, "first")\nMutableList.append(list, "second")\nMutableList.prepend(list, "beginning")\n\nconsole.log(list.length) // 3\n\n// Take elements in FIFO order (from head)\nconsole.log(MutableList.take(list)) // "beginning"\nconsole.log(MutableList.take(list)) // "first"\nconsole.log(MutableList.take(list)) // "second"';
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
