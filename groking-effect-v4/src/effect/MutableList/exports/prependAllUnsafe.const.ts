/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: prependAllUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:50:37.846Z
 *
 * Overview:
 * Prepends all elements from a ReadonlyArray to the beginning of the MutableList. This is an optimized version that can reuse the array when mutable=true.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<number>()
 * MutableList.append(list, 4)
 *
 * // Safe usage (default mutable=false)
 * const items = [1, 2, 3]
 * MutableList.prependAllUnsafe(list, items)
 * console.log(items) // [1, 2, 3] - unchanged
 *
 * // Unsafe but efficient usage (mutable=true)
 * const mutableItems = [10, 20, 30]
 * MutableList.prependAllUnsafe(list, mutableItems, true)
 * // mutableItems may be modified internally for efficiency
 *
 * console.log(MutableList.takeAll(list)) // [10, 20, 30, 1, 2, 3, 4]
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
const exportName = "prependAllUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "Prepends all elements from a ReadonlyArray to the beginning of the MutableList. This is an optimized version that can reuse the array when mutable=true.";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<number>()\nMutableList.append(list, 4)\n\n// Safe usage (default mutable=false)\nconst items = [1, 2, 3]\nMutableList.prependAllUnsafe(list, items)\nconsole.log(items) // [1, 2, 3] - unchanged\n\n// Unsafe but efficient usage (mutable=true)\nconst mutableItems = [10, 20, 30]\nMutableList.prependAllUnsafe(list, mutableItems, true)\n// mutableItems may be modified internally for efficiency\n\nconsole.log(MutableList.takeAll(list)) // [10, 20, 30, 1, 2, 3, 4]';
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
