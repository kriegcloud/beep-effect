/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: update
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:50:37.857Z
 *
 * Overview:
 * Updates the MutableRef with the result of applying a function to its current value, and returns the reference.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const counter = MutableRef.make(5)
 *
 * // Increment the counter
 * MutableRef.update(counter, (n) => n + 1)
 * console.log(MutableRef.get(counter)) // 6
 *
 * // Chain updates (since it returns the ref)
 * const result = MutableRef.update(counter, (n) => n * 2)
 * console.log(result === counter) // true (same reference)
 * console.log(MutableRef.get(counter)) // 12
 *
 * // Transform string
 * const message = MutableRef.make("hello")
 * MutableRef.update(message, (s) => s.toUpperCase())
 * console.log(MutableRef.get(message)) // "HELLO"
 *
 * // Update complex objects
 * const user = MutableRef.make({ name: "Alice", age: 30 })
 * MutableRef.update(user, (u) => ({ ...u, age: u.age + 1 }))
 * console.log(MutableRef.get(user)) // { name: "Alice", age: 31 }
 *
 * // Pipe-able version
 * const double = MutableRef.update((n: number) => n * 2)
 * double(counter)
 * console.log(MutableRef.get(counter)) // 24
 *
 * // Array operations
 * const list = MutableRef.make<Array<number>>([1, 2, 3])
 * MutableRef.update(list, (arr) => [...arr, 4])
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
const exportName = "update";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary =
  "Updates the MutableRef with the result of applying a function to its current value, and returns the reference.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst counter = MutableRef.make(5)\n\n// Increment the counter\nMutableRef.update(counter, (n) => n + 1)\nconsole.log(MutableRef.get(counter)) // 6\n\n// Chain updates (since it returns the ref)\nconst result = MutableRef.update(counter, (n) => n * 2)\nconsole.log(result === counter) // true (same reference)\nconsole.log(MutableRef.get(counter)) // 12\n\n// Transform string\nconst message = MutableRef.make("hello")\nMutableRef.update(message, (s) => s.toUpperCase())\nconsole.log(MutableRef.get(message)) // "HELLO"\n\n// Update complex objects\nconst user = MutableRef.make({ name: "Alice", age: 30 })\nMutableRef.update(user, (u) => ({ ...u, age: u.age + 1 }))\nconsole.log(MutableRef.get(user)) // { name: "Alice", age: 31 }\n\n// Pipe-able version\nconst double = MutableRef.update((n: number) => n * 2)\ndouble(counter)\nconsole.log(MutableRef.get(counter)) // 24\n\n// Array operations\nconst list = MutableRef.make<Array<number>>([1, 2, 3])\nMutableRef.update(list, (arr) => [...arr, 4])\nconsole.log(MutableRef.get(list)) // [1, 2, 3, 4]';
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
