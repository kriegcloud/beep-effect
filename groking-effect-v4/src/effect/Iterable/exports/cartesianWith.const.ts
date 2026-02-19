/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: cartesianWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:50:37.168Z
 *
 * Overview:
 * Zips this Iterable crosswise with the specified Iterable using the specified combiner.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 *
 * // Create coordinate pairs
 * const xs = [1, 2]
 * const ys = ["a", "b", "c"]
 * const coordinates = Iterable.cartesianWith(xs, ys, (x, y) => `(${x},${y})`)
 * console.log(Array.from(coordinates)) // ["(1,a)", "(1,b)", "(1,c)", "(2,a)", "(2,b)", "(2,c)"]
 *
 * // Generate all combinations of options
 * const sizes = ["S", "M", "L"]
 * const colors = ["red", "blue"]
 * const products = Iterable.cartesianWith(
 *   sizes,
 *   colors,
 *   (size, color) => ({ size, color })
 * )
 * console.log(Array.from(products))
 * // [
 * //   { size: "S", color: "red" }, { size: "S", color: "blue" },
 * //   { size: "M", color: "red" }, { size: "M", color: "blue" },
 * //   { size: "L", color: "red" }, { size: "L", color: "blue" }
 * // ]
 *
 * // Mathematical operations on all pairs
 * const a = [1, 2, 3]
 * const b = [10, 20]
 * const mathProducts = Iterable.cartesianWith(a, b, (x, y) => x * y)
 * console.log(Array.from(mathProducts)) // [10, 20, 20, 40, 30, 60]
 *
 * // Create test data combinations
 * const userTypes = ["admin", "user"]
 * const features = ["read", "write", "delete"]
 * const testCases = Iterable.cartesianWith(
 *   userTypes,
 *   features,
 *   (user, feature) => `${user}_can_${feature}`
 * )
 * console.log(Array.from(testCases))
 * // ["admin_can_read", "admin_can_write", "admin_can_delete", "user_can_read", "user_can_write", "user_can_delete"]
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
const exportName = "cartesianWith";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Zips this Iterable crosswise with the specified Iterable using the specified combiner.";
const sourceExample =
  'import { Iterable } from "effect"\n\n// Create coordinate pairs\nconst xs = [1, 2]\nconst ys = ["a", "b", "c"]\nconst coordinates = Iterable.cartesianWith(xs, ys, (x, y) => `(${x},${y})`)\nconsole.log(Array.from(coordinates)) // ["(1,a)", "(1,b)", "(1,c)", "(2,a)", "(2,b)", "(2,c)"]\n\n// Generate all combinations of options\nconst sizes = ["S", "M", "L"]\nconst colors = ["red", "blue"]\nconst products = Iterable.cartesianWith(\n  sizes,\n  colors,\n  (size, color) => ({ size, color })\n)\nconsole.log(Array.from(products))\n// [\n//   { size: "S", color: "red" }, { size: "S", color: "blue" },\n//   { size: "M", color: "red" }, { size: "M", color: "blue" },\n//   { size: "L", color: "red" }, { size: "L", color: "blue" }\n// ]\n\n// Mathematical operations on all pairs\nconst a = [1, 2, 3]\nconst b = [10, 20]\nconst mathProducts = Iterable.cartesianWith(a, b, (x, y) => x * y)\nconsole.log(Array.from(mathProducts)) // [10, 20, 20, 40, 30, 60]\n\n// Create test data combinations\nconst userTypes = ["admin", "user"]\nconst features = ["read", "write", "delete"]\nconst testCases = Iterable.cartesianWith(\n  userTypes,\n  features,\n  (user, feature) => `${user}_can_${feature}`\n)\nconsole.log(Array.from(testCases))\n// ["admin_can_read", "admin_can_write", "admin_can_delete", "user_can_read", "user_can_write", "user_can_delete"]';
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
