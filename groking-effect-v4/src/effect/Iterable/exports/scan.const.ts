/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: scan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.236Z
 *
 * Overview:
 * Reduce an `Iterable` from the left, keeping all intermediate results instead of only the final result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * // Running sum of numbers
 * const numbers = [1, 2, 3, 4, 5]
 * const runningSum = Iterable.scan(numbers, 0, (acc, n) => acc + n)
 * console.log(Array.from(runningSum)) // [0, 1, 3, 6, 10, 15]
 * 
 * // Build strings progressively
 * const letters = ["a", "b", "c"]
 * const progressive = Iterable.scan(letters, "", (acc, letter) => acc + letter)
 * console.log(Array.from(progressive)) // ["", "a", "ab", "abc"]
 * 
 * // Track maximum values seen so far
 * const values = [3, 1, 4, 1, 5, 9, 2]
 * const runningMax = Iterable.scan(values, -Infinity, Math.max)
 * console.log(Array.from(runningMax)) // [-Infinity, 3, 3, 4, 4, 5, 9, 9]
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
const exportName = "scan";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Reduce an `Iterable` from the left, keeping all intermediate results instead of only the final result.";
const sourceExample = "import { Iterable } from \"effect\"\n\n// Running sum of numbers\nconst numbers = [1, 2, 3, 4, 5]\nconst runningSum = Iterable.scan(numbers, 0, (acc, n) => acc + n)\nconsole.log(Array.from(runningSum)) // [0, 1, 3, 6, 10, 15]\n\n// Build strings progressively\nconst letters = [\"a\", \"b\", \"c\"]\nconst progressive = Iterable.scan(letters, \"\", (acc, letter) => acc + letter)\nconsole.log(Array.from(progressive)) // [\"\", \"a\", \"ab\", \"abc\"]\n\n// Track maximum values seen so far\nconst values = [3, 1, 4, 1, 5, 9, 2]\nconst runningMax = Iterable.scan(values, -Infinity, Math.max)\nconsole.log(Array.from(runningMax)) // [-Infinity, 3, 3, 4, 4, 5, 9, 9]";
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
