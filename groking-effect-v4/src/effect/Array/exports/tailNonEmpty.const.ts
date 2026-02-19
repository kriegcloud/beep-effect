/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: tailNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Returns all elements except the first of a `NonEmptyReadonlyArray`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.tailNonEmpty([1, 2, 3, 4])) // [2, 3, 4]
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
const exportName = "tailNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns all elements except the first of a `NonEmptyReadonlyArray`.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.tailNonEmpty([1, 2, 3, 4])) // [2, 3, 4]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata for tailNonEmpty.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`tailNonEmpty.length at runtime: ${A.tailNonEmpty.length}`);
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4] as const;
  const tail = A.tailNonEmpty(input);

  yield* Console.log(`Array.tailNonEmpty(${JSON.stringify(input)}) -> ${JSON.stringify(tail)}`);
});

const exampleBoundaryAndSafeAlternative = Effect.gen(function* () {
  const singleton = [42] as const;
  const singletonTail = A.tailNonEmpty(singleton);
  const maybeEmpty: ReadonlyArray<number> = [];
  const safeTail = A.tail(maybeEmpty);

  yield* Console.log(`Array.tailNonEmpty(${JSON.stringify(singleton)}) -> ${JSON.stringify(singletonTail)}`);
  yield* Console.log("Contract note: tailNonEmpty requires a non-empty array.");
  yield* Console.log(
    `For possibly-empty input use Array.tail([]) -> ${safeTail === undefined ? "undefined" : JSON.stringify(safeTail)}`
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
      title: "Runtime Shape Inspection",
      description: "Inspect runtime shape and callable metadata for tailNonEmpty.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Run the documented non-empty input example and confirm the first element is removed.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Boundary + Safe Alternative",
      description: "Show singleton behavior and when to prefer Array.tail for uncertain inputs.",
      run: exampleBoundaryAndSafeAlternative,
    },
  ],
});

BunRuntime.runMain(program);
