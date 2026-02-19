/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: Empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * A unique symbol used to represent an empty result when taking elements from a MutableList. This symbol is returned by `take` when the list is empty, allowing for safe type checking.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * const list = MutableList.make<string>()
 *
 * // Take from empty list returns Empty symbol
 * const result = MutableList.take(list)
 * console.log(result === MutableList.Empty) // true
 *
 * // Safe pattern for checking emptiness
 * const processNext = (queue: MutableList.MutableList<string>) => {
 *   const item = MutableList.take(queue)
 *   if (item === MutableList.Empty) {
 *     console.log("Queue is empty")
 *     return null
 *   }
 *   return item.toUpperCase()
 * }
 *
 * // Compare with other empty results
 * MutableList.append(list, "hello")
 * const next = MutableList.take(list)
 * console.log(next !== MutableList.Empty) // true, got "hello"
 *
 * const empty = MutableList.take(list)
 * console.log(empty === MutableList.Empty) // true, list is empty
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
const exportName = "Empty";
const exportKind = "const";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "A unique symbol used to represent an empty result when taking elements from a MutableList. This symbol is returned by `take` when the list is empty, allowing for safe type check...";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\nconst list = MutableList.make<string>()\n\n// Take from empty list returns Empty symbol\nconst result = MutableList.take(list)\nconsole.log(result === MutableList.Empty) // true\n\n// Safe pattern for checking emptiness\nconst processNext = (queue: MutableList.MutableList<string>) => {\n  const item = MutableList.take(queue)\n  if (item === MutableList.Empty) {\n    console.log("Queue is empty")\n    return null\n  }\n  return item.toUpperCase()\n}\n\n// Compare with other empty results\nMutableList.append(list, "hello")\nconst next = MutableList.take(list)\nconsole.log(next !== MutableList.Empty) // true, got "hello"\n\nconst empty = MutableList.take(list)\nconsole.log(empty === MutableList.Empty) // true, list is empty';
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
