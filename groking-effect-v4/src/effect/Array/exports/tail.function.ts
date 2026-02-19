/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: tail
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Returns all elements except the first, or `undefined` if the array is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.tail([1, 2, 3, 4])) // [2, 3, 4]
 * console.log(Array.tail([])) // undefined
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "tail";
const exportKind = "function";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns all elements except the first, or `undefined` if the array is empty.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.tail([1, 2, 3, 4])) // [2, 3, 4]\nconsole.log(Array.tail([])) // undefined';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4];
  const result = A.tail(input);
  const formattedResult = result === undefined ? "undefined" : `[${result.join(", ")}]`;

  yield* Console.log(`tail([${input.join(", ")}]) -> ${formattedResult}`);
});

const exampleEmptyArrayBoundary = Effect.gen(function* () {
  const input: ReadonlyArray<number> = [];
  const result = A.tail(input);

  yield* Console.log(`tail([]) -> ${result === undefined ? "undefined" : `[${result.join(", ")}]`}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Mirror the documented example with a non-empty array input.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Boundary: Empty Input",
      description: "Show that an empty array returns undefined.",
      run: exampleEmptyArrayBoundary,
    },
  ],
});

BunRuntime.runMain(program);
