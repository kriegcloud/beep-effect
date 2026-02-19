/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: isArrayEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Tests whether a mutable `Array` is empty, narrowing the type to `[]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isArrayEmpty([])) // true
 * console.log(Array.isArrayEmpty([1, 2, 3])) // false
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
const exportName = "isArrayEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Tests whether a mutable `Array` is empty, narrowing the type to `[]`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.isArrayEmpty([])) // true\nconsole.log(Array.isArrayEmpty([1, 2, 3])) // false';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape and preview for Array.isArrayEmpty.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const emptyResult = A.isArrayEmpty([]);
  const nonEmptyResult = A.isArrayEmpty([1, 2, 3]);

  yield* Console.log(`A.isArrayEmpty([]) => ${emptyResult}`);
  yield* Console.log(`A.isArrayEmpty([1, 2, 3]) => ${nonEmptyResult}`);
});

const exampleGuardedProcessing = Effect.gen(function* () {
  const batches: Array<Array<number>> = [[], [440, 660], [], [880]];

  for (const [index, batch] of batches.entries()) {
    if (A.isArrayEmpty(batch)) {
      yield* Console.log(`batch ${index}: empty`);
      continue;
    }

    const average = batch.reduce((sum, value) => sum + value, 0) / batch.length;
    yield* Console.log(`batch ${index}: size=${batch.length}, avg=${average}`);
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
      description: "Mirror the JSDoc checks for empty and non-empty mutable arrays.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Guarded Batch Processing",
      description: "Skip empty batches and process non-empty batches after the emptiness check.",
      run: exampleGuardedProcessing,
    },
  ],
});

BunRuntime.runMain(program);
