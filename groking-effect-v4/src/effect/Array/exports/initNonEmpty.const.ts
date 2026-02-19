/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: initNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Returns all elements except the last of a `NonEmptyReadonlyArray`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.initNonEmpty([1, 2, 3, 4])) // [1, 2, 3]
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
const exportName = "initNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns all elements except the last of a `NonEmptyReadonlyArray`.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.initNonEmpty([1, 2, 3, 4])) // [1, 2, 3]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4] as const;
  const result = A.initNonEmpty(input);

  yield* Console.log(`typeof initNonEmpty: ${typeof A.initNonEmpty}`);
  yield* Console.log(`runtime parameter count: ${A.initNonEmpty.length}`);
  yield* Console.log(`Array.initNonEmpty(${JSON.stringify(input)}) -> ${JSON.stringify(result)}`);
});

const exampleBoundaryAndSafeAlternative = Effect.gen(function* () {
  const singleton = [42] as const;
  const singletonResult = A.initNonEmpty(singleton);
  const maybeEmpty: ReadonlyArray<number> = [];
  const safeResult = A.init(maybeEmpty);

  yield* Console.log(`Array.initNonEmpty(${JSON.stringify(singleton)}) -> ${JSON.stringify(singletonResult)}`);
  yield* Console.log("Contract note: initNonEmpty requires a non-empty array.");
  yield* Console.log(
    `For possibly-empty input use Array.init([]) -> ${safeResult === undefined ? "undefined" : JSON.stringify(safeResult)}`
  );
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
      title: "Source-Aligned Invocation",
      description: "Run the documented non-empty input example and confirm output shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Boundary + Safe Alternative",
      description: "Show singleton behavior and when to prefer Array.init for uncertain inputs.",
      run: exampleBoundaryAndSafeAlternative,
    },
  ],
});

BunRuntime.runMain(program);
