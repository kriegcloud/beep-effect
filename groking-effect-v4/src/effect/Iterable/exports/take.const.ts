/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: take
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.236Z
 *
 * Overview:
 * Keep only a max number of elements from the start of an `Iterable`, creating a new `Iterable`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * const numbers = [1, 2, 3, 4, 5]
 * const firstThree = Iterable.take(numbers, 3)
 * console.log(Array.from(firstThree)) // [1, 2, 3]
 * 
 * // Taking more than available returns all elements
 * const firstTen = Iterable.take(numbers, 10)
 * console.log(Array.from(firstTen)) // [1, 2, 3, 4, 5]
 * 
 * // Taking 0 or negative returns empty
 * const none = Iterable.take(numbers, 0)
 * console.log(Array.from(none)) // []
 * 
 * // Useful with infinite iterables
 * const naturals = Iterable.range(1)
 * const firstFive = Iterable.take(naturals, 5)
 * console.log(Array.from(firstFive)) // [1, 2, 3, 4, 5]
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
const exportName = "take";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Keep only a max number of elements from the start of an `Iterable`, creating a new `Iterable`.";
const sourceExample = "import { Iterable } from \"effect\"\n\nconst numbers = [1, 2, 3, 4, 5]\nconst firstThree = Iterable.take(numbers, 3)\nconsole.log(Array.from(firstThree)) // [1, 2, 3]\n\n// Taking more than available returns all elements\nconst firstTen = Iterable.take(numbers, 10)\nconsole.log(Array.from(firstTen)) // [1, 2, 3, 4, 5]\n\n// Taking 0 or negative returns empty\nconst none = Iterable.take(numbers, 0)\nconsole.log(Array.from(none)) // []\n\n// Useful with infinite iterables\nconst naturals = Iterable.range(1)\nconst firstFive = Iterable.take(naturals, 5)\nconsole.log(Array.from(firstFive)) // [1, 2, 3, 4, 5]";
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
