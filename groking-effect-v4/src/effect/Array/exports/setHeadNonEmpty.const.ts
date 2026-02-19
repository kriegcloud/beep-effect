/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: setHeadNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Replaces the first element of a non-empty array with a new value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.setHeadNonEmpty([1, 2, 3], 10)) // [10, 2, 3]
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
const exportName = "setHeadNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Replaces the first element of a non-empty array with a new value.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.setHeadNonEmpty([1, 2, 3], 10)) // [10, 2, 3]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeContractSnapshot = Effect.gen(function* () {
  yield* Console.log(`typeof setHeadNonEmpty -> ${typeof A.setHeadNonEmpty}`);
  yield* Console.log(`setHeadNonEmpty.length -> ${A.setHeadNonEmpty.length}`);
  yield* Console.log("Contract: non-empty input required; returns a new array with only index 0 replaced.");
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3] as const;
  const result = A.setHeadNonEmpty(input, 10);

  yield* Console.log(`setHeadNonEmpty([1, 2, 3], 10) -> ${JSON.stringify(result)}`);
  yield* Console.log(`original input remains -> ${JSON.stringify(input)}`);
});

const exampleCurriedInvocation = Effect.gen(function* () {
  const replaceHeadWithZero = A.setHeadNonEmpty(0);
  const readings = [9, 8, 7] as const;
  const singleton = [42] as const;

  const readingsUpdated = replaceHeadWithZero(readings);
  const singletonUpdated = replaceHeadWithZero(singleton);

  yield* Console.log(`setHeadNonEmpty(0)([9, 8, 7]) -> ${JSON.stringify(readingsUpdated)}`);
  yield* Console.log(`setHeadNonEmpty(0)([42]) -> ${JSON.stringify(singletonUpdated)}`);
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
      title: "Runtime Contract Snapshot",
      description: "Confirm callable runtime shape and the non-empty contract for this helper.",
      run: exampleRuntimeContractSnapshot,
    },
    {
      title: "Source-Aligned Head Replacement",
      description: "Mirror the JSDoc call and show only the first element changes.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Form + Singleton Input",
      description: "Use data-last invocation and show behavior for both multi-item and single-item arrays.",
      run: exampleCurriedInvocation,
    },
  ],
});

BunRuntime.runMain(program);
