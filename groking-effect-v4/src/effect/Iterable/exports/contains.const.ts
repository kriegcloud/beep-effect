/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: contains
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Returns a function that checks if a `Iterable` contains a given value using the default `Equivalence`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * const numbers = [1, 2, 3, 4, 5]
 * console.log(Iterable.contains(numbers, 3)) // true
 * console.log(Iterable.contains(numbers, 6)) // false
 * 
 * const letters = "hello"
 * console.log(Iterable.contains(letters, "l")) // true
 * console.log(Iterable.contains(letters, "x")) // false
 * 
 * // Works with any iterable
 * const range = Iterable.range(1, 100)
 * console.log(Iterable.contains(range, 50)) // true
 * console.log(Iterable.contains(range, 150)) // false
 * 
 * // Curried version
 * const containsThree = Iterable.contains(3)
 * console.log(containsThree([1, 2, 3])) // true
 * console.log(containsThree([4, 5, 6])) // false
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as IterableModule from "effect/Iterable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "contains";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Returns a function that checks if a `Iterable` contains a given value using the default `Equivalence`.";
const sourceExample = "import { Iterable } from \"effect\"\n\nconst numbers = [1, 2, 3, 4, 5]\nconsole.log(Iterable.contains(numbers, 3)) // true\nconsole.log(Iterable.contains(numbers, 6)) // false\n\nconst letters = \"hello\"\nconsole.log(Iterable.contains(letters, \"l\")) // true\nconsole.log(Iterable.contains(letters, \"x\")) // false\n\n// Works with any iterable\nconst range = Iterable.range(1, 100)\nconsole.log(Iterable.contains(range, 50)) // true\nconsole.log(Iterable.contains(range, 150)) // false\n\n// Curried version\nconst containsThree = Iterable.contains(3)\nconsole.log(containsThree([1, 2, 3])) // true\nconsole.log(containsThree([4, 5, 6])) // false";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
