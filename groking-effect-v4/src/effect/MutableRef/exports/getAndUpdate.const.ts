/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: getAndUpdate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:50:37.857Z
 *
 * Overview:
 * Updates the MutableRef with the result of applying a function to its current value, and returns the previous value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const counter = MutableRef.make(5)
 *
 * // Increment and get the old value
 * const oldValue = MutableRef.getAndUpdate(counter, (n) => n + 1)
 * console.log(oldValue) // 5
 * console.log(MutableRef.get(counter)) // 6
 *
 * // Double the value and get the previous one
 * const previous = MutableRef.getAndUpdate(counter, (n) => n * 2)
 * console.log(previous) // 6
 * console.log(MutableRef.get(counter)) // 12
 *
 * // Transform string and get old value
 * const message = MutableRef.make("hello")
 * const oldMessage = MutableRef.getAndUpdate(message, (s) => s.toUpperCase())
 * console.log(oldMessage) // "hello"
 * console.log(MutableRef.get(message)) // "HELLO"
 *
 * // Pipe-able version
 * const addOne = MutableRef.getAndUpdate((n: number) => n + 1)
 * const result = addOne(counter)
 * console.log(result) // Previous value before increment
 *
 * // Useful for implementing atomic operations
 * const list = MutableRef.make<Array<number>>([1, 2, 3])
 * const oldList = MutableRef.getAndUpdate(list, (arr) => [...arr, 4])
 * console.log(oldList) // [1, 2, 3]
 * console.log(MutableRef.get(list)) // [1, 2, 3, 4]
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
import * as MutableRefModule from "effect/MutableRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getAndUpdate";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary =
  "Updates the MutableRef with the result of applying a function to its current value, and returns the previous value.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst counter = MutableRef.make(5)\n\n// Increment and get the old value\nconst oldValue = MutableRef.getAndUpdate(counter, (n) => n + 1)\nconsole.log(oldValue) // 5\nconsole.log(MutableRef.get(counter)) // 6\n\n// Double the value and get the previous one\nconst previous = MutableRef.getAndUpdate(counter, (n) => n * 2)\nconsole.log(previous) // 6\nconsole.log(MutableRef.get(counter)) // 12\n\n// Transform string and get old value\nconst message = MutableRef.make("hello")\nconst oldMessage = MutableRef.getAndUpdate(message, (s) => s.toUpperCase())\nconsole.log(oldMessage) // "hello"\nconsole.log(MutableRef.get(message)) // "HELLO"\n\n// Pipe-able version\nconst addOne = MutableRef.getAndUpdate((n: number) => n + 1)\nconst result = addOne(counter)\nconsole.log(result) // Previous value before increment\n\n// Useful for implementing atomic operations\nconst list = MutableRef.make<Array<number>>([1, 2, 3])\nconst oldList = MutableRef.getAndUpdate(list, (arr) => [...arr, 4])\nconsole.log(oldList) // [1, 2, 3]\nconsole.log(MutableRef.get(list)) // [1, 2, 3, 4]';
const moduleRecord = MutableRefModule as Record<string, unknown>;

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
