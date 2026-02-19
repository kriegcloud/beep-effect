/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ordering
 * Export: reverse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ordering.ts
 * Generated: 2026-02-19T04:14:15.476Z
 *
 * Overview:
 * Inverts the ordering of the input Ordering. This is useful for creating descending sort orders from ascending ones.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Ordering } from "effect"
 * 
 * // Basic reversal
 * console.log(Ordering.reverse(1)) // -1 (greater becomes less)
 * console.log(Ordering.reverse(-1)) // 1 (less becomes greater)
 * console.log(Ordering.reverse(0)) // 0 (equal stays equal)
 * 
 * // Creating descending sort from ascending comparison
 * const compareNumbers = (a: number, b: number): Ordering.Ordering =>
 *   a < b ? -1 : a > b ? 1 : 0
 * 
 * const compareDescending = (a: number, b: number): Ordering.Ordering =>
 *   Ordering.reverse(compareNumbers(a, b))
 * 
 * const numbers = [3, 1, 4, 1, 5]
 * numbers.sort(compareNumbers) // [1, 1, 3, 4, 5] (ascending)
 * numbers.sort(compareDescending) // [5, 4, 3, 1, 1] (descending)
 * 
 * // Useful for toggling sort direction
 * const createSorter = (ascending: boolean) => (a: number, b: number) => {
 *   const ordering = compareNumbers(a, b)
 *   return ascending ? ordering : Ordering.reverse(ordering)
 * }
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
import * as OrderingModule from "effect/Ordering";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "reverse";
const exportKind = "const";
const moduleImportPath = "effect/Ordering";
const sourceSummary = "Inverts the ordering of the input Ordering. This is useful for creating descending sort orders from ascending ones.";
const sourceExample = "import { Ordering } from \"effect\"\n\n// Basic reversal\nconsole.log(Ordering.reverse(1)) // -1 (greater becomes less)\nconsole.log(Ordering.reverse(-1)) // 1 (less becomes greater)\nconsole.log(Ordering.reverse(0)) // 0 (equal stays equal)\n\n// Creating descending sort from ascending comparison\nconst compareNumbers = (a: number, b: number): Ordering.Ordering =>\n  a < b ? -1 : a > b ? 1 : 0\n\nconst compareDescending = (a: number, b: number): Ordering.Ordering =>\n  Ordering.reverse(compareNumbers(a, b))\n\nconst numbers = [3, 1, 4, 1, 5]\nnumbers.sort(compareNumbers) // [1, 1, 3, 4, 5] (ascending)\nnumbers.sort(compareDescending) // [5, 4, 3, 1, 1] (descending)\n\n// Useful for toggling sort direction\nconst createSorter = (ascending: boolean) => (a: number, b: number) => {\n  const ordering = compareNumbers(a, b)\n  return ascending ? ordering : Ordering.reverse(ordering)\n}";
const moduleRecord = OrderingModule as Record<string, unknown>;

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
