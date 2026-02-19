/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: containsWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Returns a membership-test function using a custom equivalence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const containsNumber = Array.containsWith((a: number, b: number) => a === b)
 * console.log(pipe([1, 2, 3, 4], containsNumber(3))) // true
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "containsWith";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns a membership-test function using a custom equivalence.";
const sourceExample =
  'import { Array, pipe } from "effect"\n\nconst containsNumber = Array.containsWith((a: number, b: number) => a === b)\nconsole.log(pipe([1, 2, 3, 4], containsNumber(3))) // true';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export and confirm it is a higher-order function.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedCurriedUsage = Effect.gen(function* () {
  const numbers = [1, 2, 3, 4];
  const containsNumber = A.containsWith((a: number, b: number) => a === b);
  const hasThree = containsNumber(3)(numbers);
  const hasNine = containsNumber(9)(numbers);

  yield* Console.log(`containsNumber(3)([1,2,3,4]) -> ${hasThree}`);
  yield* Console.log(`containsNumber(9)([1,2,3,4]) -> ${hasNine}`);
});

const exampleTwoArgumentUsage = Effect.gen(function* () {
  type User = { readonly id: number; readonly name: string };
  const users: ReadonlyArray<User> = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
  ];
  const containsById = A.containsWith<User>((left, right) => left.id === right.id);

  const existingById = containsById(users, { id: 2, name: "Different Name" });
  const missingById = containsById(users, { id: 3, name: "Linus" });

  yield* Console.log(`containsById(users, { id: 2, ... }) -> ${existingById}`);
  yield* Console.log(`containsById(users, { id: 3, ... }) -> ${missingById}`);
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
      title: "Source-Aligned Curried Usage",
      description: "Build a membership test with number equality and run positive/negative checks.",
      run: exampleSourceAlignedCurriedUsage,
    },
    {
      title: "Two-Argument Overload Usage",
      description: "Use the `(self, value)` form with object comparison based on custom equivalence.",
      run: exampleTwoArgumentUsage,
    },
  ],
});

BunRuntime.runMain(program);
