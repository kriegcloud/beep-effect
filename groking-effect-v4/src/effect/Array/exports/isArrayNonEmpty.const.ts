/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: isArrayNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Tests whether a mutable `Array` is non-empty, narrowing the type to `NonEmptyArray`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isArrayNonEmpty([])) // false
 * console.log(Array.isArrayNonEmpty([1, 2, 3])) // true
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
const exportName = "isArrayNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Tests whether a mutable `Array` is non-empty, narrowing the type to `NonEmptyArray`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.isArrayNonEmpty([])) // false\nconsole.log(Array.isArrayNonEmpty([1, 2, 3])) // true';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const empty: Array<number> = [];
  const numbers = [1, 2, 3];
  const emptyResult = A.isArrayNonEmpty(empty);
  const numbersResult = A.isArrayNonEmpty(numbers);

  yield* Console.log(`isArrayNonEmpty([]) => ${emptyResult}`);
  yield* Console.log(`isArrayNonEmpty([1, 2, 3]) => ${numbersResult}`);
});

const exampleNarrowingForHeadAccess = Effect.gen(function* () {
  const batches: Array<Array<string>> = [[], ["alpha", "beta"]];

  for (const batch of batches) {
    if (A.isArrayNonEmpty(batch)) {
      yield* Console.log(`non-empty batch head => ${batch[0]}`);
    } else {
      yield* Console.log("empty batch has no head element");
    }
  }
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
      title: "Source-Aligned Invocation",
      description: "Run the documented empty/non-empty checks and observe true/false outcomes.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Type-Narrowing Guard",
      description: "Use isArrayNonEmpty as a guard before reading the first array element.",
      run: exampleNarrowingForHeadAccess,
    },
  ],
});

BunRuntime.runMain(program);
