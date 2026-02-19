/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: appendAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.233Z
 *
 * Overview:
 * Concatenates two iterables, combining their elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * const first = [1, 2, 3]
 * const second = [4, 5, 6]
 * const combined = Iterable.appendAll(first, second)
 * console.log(Array.from(combined)) // [1, 2, 3, 4, 5, 6]
 *
 * // Works with different iterable types
 * const numbers = [1, 2]
 * const letters = "abc"
 * const mixed = Iterable.appendAll(numbers, letters)
 * console.log(Array.from(mixed)) // [1, 2, "a", "b", "c"]
 *
 * // Lazy evaluation - only consumes what's needed
 * const infinite = Iterable.range(1)
 * const finite = [0, -1, -2]
 * const result = Iterable.take(Iterable.appendAll(finite, infinite), 5)
 * console.log(Array.from(result)) // [0, -1, -2, 1, 2]
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
const exportName = "appendAll";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Concatenates two iterables, combining their elements.";
const sourceExample =
  'import { Iterable } from "effect"\n\nconst first = [1, 2, 3]\nconst second = [4, 5, 6]\nconst combined = Iterable.appendAll(first, second)\nconsole.log(Array.from(combined)) // [1, 2, 3, 4, 5, 6]\n\n// Works with different iterable types\nconst numbers = [1, 2]\nconst letters = "abc"\nconst mixed = Iterable.appendAll(numbers, letters)\nconsole.log(Array.from(mixed)) // [1, 2, "a", "b", "c"]\n\n// Lazy evaluation - only consumes what\'s needed\nconst infinite = Iterable.range(1)\nconst finite = [0, -1, -2]\nconst result = Iterable.take(Iterable.appendAll(finite, infinite), 5)\nconsole.log(Array.from(result)) // [0, -1, -2, 1, 2]';
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
