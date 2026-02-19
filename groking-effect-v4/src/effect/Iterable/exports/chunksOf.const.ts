/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: chunksOf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Splits an `Iterable` into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of the `Iterable`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * const chunks = Iterable.chunksOf(numbers, 3)
 * console.log(Array.from(chunks).map((chunk) => Array.from(chunk)))
 * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 * 
 * // Last chunk can be shorter
 * const uneven = [1, 2, 3, 4, 5, 6, 7]
 * const chunks2 = Iterable.chunksOf(uneven, 3)
 * console.log(Array.from(chunks2).map((chunk) => Array.from(chunk)))
 * // [[1, 2, 3], [4, 5, 6], [7]]
 * 
 * // Chunk size larger than iterable
 * const small = [1, 2]
 * const chunks3 = Iterable.chunksOf(small, 5)
 * console.log(Array.from(chunks3).map((chunk) => Array.from(chunk)))
 * // [[1, 2]]
 * 
 * // Process data in batches
 * const data = Iterable.range(1, 100)
 * const batches = Iterable.chunksOf(data, 10)
 * const batchSums = Iterable.map(
 *   batches,
 *   (batch) => Iterable.reduce(batch, 0, (sum, n) => sum + n)
 * )
 * console.log(Array.from(Iterable.take(batchSums, 3))) // [55, 155, 255]
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
const exportName = "chunksOf";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Splits an `Iterable` into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of the `Iterable`.";
const sourceExample = "import { Iterable } from \"effect\"\n\nconst numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]\nconst chunks = Iterable.chunksOf(numbers, 3)\nconsole.log(Array.from(chunks).map((chunk) => Array.from(chunk)))\n// [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\n\n// Last chunk can be shorter\nconst uneven = [1, 2, 3, 4, 5, 6, 7]\nconst chunks2 = Iterable.chunksOf(uneven, 3)\nconsole.log(Array.from(chunks2).map((chunk) => Array.from(chunk)))\n// [[1, 2, 3], [4, 5, 6], [7]]\n\n// Chunk size larger than iterable\nconst small = [1, 2]\nconst chunks3 = Iterable.chunksOf(small, 5)\nconsole.log(Array.from(chunks3).map((chunk) => Array.from(chunk)))\n// [[1, 2]]\n\n// Process data in batches\nconst data = Iterable.range(1, 100)\nconst batches = Iterable.chunksOf(data, 10)\nconst batchSums = Iterable.map(\n  batches,\n  (batch) => Iterable.reduce(batch, 0, (sum, n) => sum + n)\n)\nconsole.log(Array.from(Iterable.take(batchSums, 3))) // [55, 155, 255]";
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
