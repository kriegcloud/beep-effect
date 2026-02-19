/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: containsWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.169Z
 *
 * Overview:
 * Returns a function that checks if an `Iterable` contains a given value using a provided `isEquivalent` function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Custom equivalence for objects
 * const byId = (a: { id: number }, b: { id: number }) => a.id === b.id
 * const containsById = Iterable.containsWith(byId)
 *
 * const users = [{ id: 1 }, { id: 2 }]
 * const hasUser1 = containsById(users, { id: 1 })
 * console.log(hasUser1) // true (same id)
 *
 * // Case-insensitive string comparison
 * const caseInsensitive = (a: string, b: string) =>
 *   a.toLowerCase() === b.toLowerCase()
 * const containsCaseInsensitive = Iterable.containsWith(caseInsensitive)
 *
 * const words = ["Hello", "World"]
 * const hasHello = containsCaseInsensitive(words, "hello")
 * console.log(hasHello) // true
 *
 * // Approximate number comparison
 * const approxEqual = (a: number, b: number) => Math.abs(a - b) < 0.1
 * const containsApprox = Iterable.containsWith(approxEqual)
 *
 * const values = [1.0, 2.0, 3.0]
 * const hasAlmostTwo = containsApprox(values, 2.05)
 * console.log(hasAlmostTwo) // true
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
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "containsWith";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary =
  "Returns a function that checks if an `Iterable` contains a given value using a provided `isEquivalent` function.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Custom equivalence for objects\nconst byId = (a: { id: number }, b: { id: number }) => a.id === b.id\nconst containsById = Iterable.containsWith(byId)\n\nconst users = [{ id: 1 }, { id: 2 }]\nconst hasUser1 = containsById(users, { id: 1 })\nconsole.log(hasUser1) // true (same id)\n\n// Case-insensitive string comparison\nconst caseInsensitive = (a: string, b: string) =>\n  a.toLowerCase() === b.toLowerCase()\nconst containsCaseInsensitive = Iterable.containsWith(caseInsensitive)\n\nconst words = ["Hello", "World"]\nconst hasHello = containsCaseInsensitive(words, "hello")\nconsole.log(hasHello) // true\n\n// Approximate number comparison\nconst approxEqual = (a: number, b: number) => Math.abs(a - b) < 0.1\nconst containsApprox = Iterable.containsWith(approxEqual)\n\nconst values = [1.0, 2.0, 3.0]\nconst hasAlmostTwo = containsApprox(values, 2.05)\nconsole.log(hasAlmostTwo) // true';
const moduleRecord = IterableModule as Record<string, unknown>;

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
