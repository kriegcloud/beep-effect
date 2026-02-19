/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: allocate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.329Z
 *
 * Overview:
 * Creates a new `Array` of the specified length with all slots uninitialized.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.allocate<number>(3)
 * console.log(result.length) // 3
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "allocate";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Creates a new `Array` of the specified length with all slots uninitialized.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.allocate<number>(3)\nconsole.log(result.length) // 3';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedLength = Effect.gen(function* () {
  yield* Console.log("Allocate three slots and confirm the fixed length.");
  const result = A.allocate<number>(3);
  yield* Console.log(`length -> ${result.length}`);
  yield* Console.log(`materialized slots -> ${Object.keys(result).length}`);
});

const exampleImperativeFill = Effect.gen(function* () {
  yield* Console.log("Fill an allocated buffer imperatively by index.");
  const tones = A.allocate<number>(4);
  for (let index = 0; index < tones.length; index++) {
    tones[index] = (index + 1) * 220;
  }
  yield* Console.log(`after assignment -> [${tones.join(", ")}]`);
  yield* Console.log(`index 0 exists -> ${0 in tones}`);
});

const exampleInvalidLength = Effect.gen(function* () {
  yield* Console.log("Invalid lengths follow native Array constructor rules.");
  for (const length of [-1, 2.5] as const) {
    try {
      A.allocate<number>(length);
      yield* Console.log(`allocate(${length}) unexpectedly succeeded`);
    } catch (error) {
      const label = error instanceof RangeError ? "RangeError" : String(error);
      yield* Console.log(`allocate(${length}) -> ${label}`);
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
      title: "Source-Aligned Allocation",
      description: "Allocate with length `3` and observe sparse-slot behavior from the JSDoc example.",
      run: exampleSourceAlignedLength,
    },
    {
      title: "Imperative Buffer Fill",
      description: "Pre-size an array and then assign values by index.",
      run: exampleImperativeFill,
    },
    {
      title: "Invalid Length Contract",
      description: "Show expected failures for negative and non-integer lengths.",
      run: exampleInvalidLength,
    },
  ],
});

BunRuntime.runMain(program);
