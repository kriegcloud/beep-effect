/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableList
 * Export: MutableList
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/MutableList.ts
 * Generated: 2026-02-19T04:14:15.165Z
 *
 * Overview:
 * A mutable linked list data structure optimized for high-throughput operations. MutableList provides efficient append/prepend operations and is ideal for producer-consumer patterns, queues, and streaming scenarios.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as MutableList from "effect/MutableList"
 *
 * // Create a mutable list
 * const list: MutableList.MutableList<number> = MutableList.make()
 *
 * // Add elements
 * MutableList.append(list, 1)
 * MutableList.append(list, 2)
 * MutableList.prepend(list, 0)
 *
 * // Access properties
 * console.log(list.length) // 3
 * console.log(list.head?.array) // Contains elements from head bucket
 * console.log(list.tail?.array) // Contains elements from tail bucket
 *
 * // Take elements
 * console.log(MutableList.take(list)) // 0
 * console.log(MutableList.take(list)) // 1
 * console.log(MutableList.take(list)) // 2
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MutableListModule from "effect/MutableList";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MutableList";
const exportKind = "interface";
const moduleImportPath = "effect/MutableList";
const sourceSummary =
  "A mutable linked list data structure optimized for high-throughput operations. MutableList provides efficient append/prepend operations and is ideal for producer-consumer patter...";
const sourceExample =
  'import * as MutableList from "effect/MutableList"\n\n// Create a mutable list\nconst list: MutableList.MutableList<number> = MutableList.make()\n\n// Add elements\nMutableList.append(list, 1)\nMutableList.append(list, 2)\nMutableList.prepend(list, 0)\n\n// Access properties\nconsole.log(list.length) // 3\nconsole.log(list.head?.array) // Contains elements from head bucket\nconsole.log(list.tail?.array) // Contains elements from tail bucket\n\n// Take elements\nconsole.log(MutableList.take(list)) // 0\nconsole.log(MutableList.take(list)) // 1\nconsole.log(MutableList.take(list)) // 2';
const moduleRecord = MutableListModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
