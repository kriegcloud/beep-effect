/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: modifyLastNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Applies a function to the last element of a non-empty array, returning a new array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.modifyLastNonEmpty([1, 2, 3], (n) => n * 2)) // [1, 2, 6]
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
const exportName = "modifyLastNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Applies a function to the last element of a non-empty array, returning a new array.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.modifyLastNonEmpty([1, 2, 3], (n) => n * 2)) // [1, 2, 6]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape for modifyLastNonEmpty.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`modifyLastNonEmpty.length at runtime: ${A.modifyLastNonEmpty.length}`);
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3] as const;
  const output = A.modifyLastNonEmpty(input, (n) => n * 2);

  yield* Console.log(`Input: [${input.join(", ")}]`);
  yield* Console.log(`modifyLastNonEmpty(..., n => n * 2) => [${output.join(", ")}]`);
});

const exampleCurriedAndSingleElement = Effect.gen(function* () {
  const padLast = A.modifyLastNonEmpty((token: string) => `${token}!`);
  const single = ["solo"] as const;
  const sequence = ["a", "b", "c"] as const;

  const singleUpdated = padLast(single);
  const sequenceUpdated = padLast(sequence);

  yield* Console.log(`Curried call on single value => [${singleUpdated.join(", ")}]`);
  yield* Console.log(`Curried call on many values => [${sequenceUpdated.join(", ")}]`);
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
      description: "Inspect runtime metadata and callable arity for modifyLastNonEmpty.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Run the documented non-empty number array transformation.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried + Single-Element Inputs",
      description: "Demonstrate dual invocation form on both one and many elements.",
      run: exampleCurriedAndSingleElement,
    },
  ],
});

BunRuntime.runMain(program);
