/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: Array
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.346Z
 *
 * Overview:
 * Reference to the global `Array` constructor.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const arr = new Array.Array(3)
 * console.log(arr) // [undefined, undefined, undefined]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ArrayModule from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Array";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Reference to the global `Array` constructor.";
const sourceExample =
  'import { Array } from "effect"\n\nconst arr = new Array.Array(3)\nconsole.log(arr) // [undefined, undefined, undefined]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleConstructWithLength = Effect.gen(function* () {
  yield* Console.log("Construct with a single number to create a sparse array.");
  const sparse = new ArrayModule.Array<number>(3);
  yield* Console.log(`length -> ${sparse.length}`);
  yield* Console.log(`index 0 exists before fill -> ${0 in sparse}`);
  sparse.fill(0);
  yield* Console.log(`after fill(0) -> [${sparse.join(", ")}]`);
});

const exampleConstructWithValues = Effect.gen(function* () {
  yield* Console.log("Construct with multiple arguments to create an array of values.");
  const tones = new ArrayModule.Array("beep", "boop", "bop");
  yield* Console.log(`initial -> [${tones.join(", ")}]`);
  tones.push("buzz");
  yield* Console.log(`after push('buzz') -> [${tones.join(", ")}]`);
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
      title: "Single-Length Construction",
      description: "Use `new Array.Array(length)` to create and then materialize sparse slots.",
      run: exampleConstructWithLength,
    },
    {
      title: "Value List Construction",
      description: "Use constructor arguments as concrete element values.",
      run: exampleConstructWithValues,
    },
  ],
});

BunRuntime.runMain(program);
