/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: drop
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Drop a max number of elements from the start of an `Iterable`
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const numbers = [1, 2, 3, 4, 5]
 * const withoutFirstTwo = Iterable.drop(numbers, 2)
 * console.log(Array.from(withoutFirstTwo)) // [3, 4, 5]
 *
 * // Dropping more than available returns empty
 * const withoutFirstTen = Iterable.drop(numbers, 10)
 * console.log(Array.from(withoutFirstTen)) // []
 *
 * // Dropping 0 or negative returns all elements
 * const all = Iterable.drop(numbers, 0)
 * console.log(Array.from(all)) // [1, 2, 3, 4, 5]
 *
 * // Combine with take for slicing
 * const slice = Iterable.take(Iterable.drop(numbers, 1), 3)
 * console.log(Array.from(slice)) // [2, 3, 4]
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
import * as IterableModule from "effect/Iterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "drop";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Drop a max number of elements from the start of an `Iterable`";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst numbers = [1, 2, 3, 4, 5]\nconst withoutFirstTwo = Iterable.drop(numbers, 2)\nconsole.log(Array.from(withoutFirstTwo)) // [3, 4, 5]\n\n// Dropping more than available returns empty\nconst withoutFirstTen = Iterable.drop(numbers, 10)\nconsole.log(Array.from(withoutFirstTen)) // []\n\n// Dropping 0 or negative returns all elements\nconst all = Iterable.drop(numbers, 0)\nconsole.log(Array.from(all)) // [1, 2, 3, 4, 5]\n\n// Combine with take for slicing\nconst slice = Iterable.take(Iterable.drop(numbers, 1), 3)\nconsole.log(Array.from(slice)) // [2, 3, 4]';
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
