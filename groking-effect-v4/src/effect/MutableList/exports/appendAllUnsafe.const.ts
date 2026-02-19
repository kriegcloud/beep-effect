/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: appendAllUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * Appends all elements from a ReadonlyArray to the end of the MutableList. This is an optimized version that can reuse the array when mutable=true. Returns the number of elements added.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<number>()
 * MutableList.append(list, 1)
 *
 * // Safe usage (default mutable=false)
 * const items = [2, 3, 4]
 * const added = MutableList.appendAllUnsafe(list, items)
 * console.log(added) // 3
 * console.log(items) // [2, 3, 4] - unchanged
 *
 * // Unsafe but efficient usage (mutable=true)
 * const mutableItems = [5, 6, 7]
 * MutableList.appendAllUnsafe(list, mutableItems, true)
 * // mutableItems may be modified internally for efficiency
 *
 * console.log(MutableList.takeAll(list)) // [1, 2, 3, 4, 5, 6, 7]
 *
 * // High-performance bulk operations
 * const bigArray = new Array(10000).fill(0).map((_, i) => i)
 * MutableList.appendAllUnsafe(list, bigArray, true) // Very efficient
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
const exportName = "appendAllUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Appends all elements from a ReadonlyArray to the end of the MutableList. This is an optimized version that can reuse the array when mutable=true. Returns the number of elements ...";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<number>()\nMutableList.append(list, 1)\n\n// Safe usage (default mutable=false)\nconst items = [2, 3, 4]\nconst added = MutableList.appendAllUnsafe(list, items)\nconsole.log(added) // 3\nconsole.log(items) // [2, 3, 4] - unchanged\n\n// Unsafe but efficient usage (mutable=true)\nconst mutableItems = [5, 6, 7]\nMutableList.appendAllUnsafe(list, mutableItems, true)\n// mutableItems may be modified internally for efficiency\n\nconsole.log(MutableList.takeAll(list)) // [1, 2, 3, 4, 5, 6, 7]\n\n// High-performance bulk operations\nconst bigArray = new Array(10000).fill(0).map((_, i) => i)\nMutableList.appendAllUnsafe(list, bigArray, true) // Very efficient';
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
