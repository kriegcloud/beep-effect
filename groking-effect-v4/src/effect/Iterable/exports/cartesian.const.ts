/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: cartesian
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.233Z
 *
 * Overview:
 * Zips this Iterable crosswise with the specified Iterable.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // All pairs of numbers and letters
 * const numbers = [1, 2, 3]
 * const letters = ["a", "b"]
 * const pairs = Iterable.cartesian(numbers, letters)
 * console.log(Array.from(pairs))
 * // [[1, "a"], [1, "b"], [2, "a"], [2, "b"], [3, "a"], [3, "b"]]
 *
 * // Generate coordinate grid
 * const x = [0, 1, 2]
 * const y = [0, 1]
 * const grid = Iterable.cartesian(x, y)
 * console.log(Array.from(grid))
 * // [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]]
 *
 * // All combinations for testing
 * const browsers = ["chrome", "firefox"]
 * const devices = ["desktop", "mobile", "tablet"]
 * const testMatrix = Iterable.cartesian(browsers, devices)
 * console.log(Array.from(testMatrix))
 * // [
 * //   ["chrome", "desktop"], ["chrome", "mobile"], ["chrome", "tablet"],
 * //   ["firefox", "desktop"], ["firefox", "mobile"], ["firefox", "tablet"]
 * // ]
 *
 * // Empty iterable results in empty cartesian product
 * const empty = Iterable.empty<number>()
 * const withEmpty = Iterable.cartesian([1, 2], empty)
 * console.log(Array.from(withEmpty)) // []
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
const exportName = "cartesian";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Zips this Iterable crosswise with the specified Iterable.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// All pairs of numbers and letters\nconst numbers = [1, 2, 3]\nconst letters = ["a", "b"]\nconst pairs = Iterable.cartesian(numbers, letters)\nconsole.log(Array.from(pairs))\n// [[1, "a"], [1, "b"], [2, "a"], [2, "b"], [3, "a"], [3, "b"]]\n\n// Generate coordinate grid\nconst x = [0, 1, 2]\nconst y = [0, 1]\nconst grid = Iterable.cartesian(x, y)\nconsole.log(Array.from(grid))\n// [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]]\n\n// All combinations for testing\nconst browsers = ["chrome", "firefox"]\nconst devices = ["desktop", "mobile", "tablet"]\nconst testMatrix = Iterable.cartesian(browsers, devices)\nconsole.log(Array.from(testMatrix))\n// [\n//   ["chrome", "desktop"], ["chrome", "mobile"], ["chrome", "tablet"],\n//   ["firefox", "desktop"], ["firefox", "mobile"], ["firefox", "tablet"]\n// ]\n\n// Empty iterable results in empty cartesian product\nconst empty = Iterable.empty<number>()\nconst withEmpty = Iterable.cartesian([1, 2], empty)\nconsole.log(Array.from(withEmpty)) // []';
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
