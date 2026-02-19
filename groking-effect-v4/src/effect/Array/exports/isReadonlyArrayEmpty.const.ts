/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: isReadonlyArrayEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Tests whether a `ReadonlyArray` is empty, narrowing the type to `readonly []`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isReadonlyArrayEmpty([])) // true
 * console.log(Array.isReadonlyArrayEmpty([1, 2, 3])) // false
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
const exportName = "isReadonlyArrayEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Tests whether a `ReadonlyArray` is empty, narrowing the type to `readonly []`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.isReadonlyArrayEmpty([])) // true\nconsole.log(Array.isReadonlyArrayEmpty([1, 2, 3])) // false';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape and preview for Array.isReadonlyArrayEmpty.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const emptyResult = A.isReadonlyArrayEmpty([]);
  const nonEmptyResult = A.isReadonlyArrayEmpty([1, 2, 3]);

  yield* Console.log(`A.isReadonlyArrayEmpty([]) => ${emptyResult}`);
  yield* Console.log(`A.isReadonlyArrayEmpty([1, 2, 3]) => ${nonEmptyResult}`);
});

const exampleReadonlyBatchGuard = Effect.gen(function* () {
  const batches: ReadonlyArray<ReadonlyArray<number>> = [[], [440, 660], [], [880]];

  for (const [index, batch] of batches.entries()) {
    if (A.isReadonlyArrayEmpty(batch)) {
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
      description: "Mirror the JSDoc checks for empty and non-empty readonly arrays.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Readonly Batch Guard",
      description: "Skip empty readonly batches and process non-empty batches after the emptiness check.",
      run: exampleReadonlyBatchGuard,
    },
  ],
});

BunRuntime.runMain(program);
