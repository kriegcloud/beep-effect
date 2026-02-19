/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: init
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Returns all elements except the last, or `undefined` if the array is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.init([1, 2, 3, 4])) // [1, 2, 3]
 * console.log(Array.init([])) // undefined
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
const exportName = "init";
const exportKind = "function";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns all elements except the last, or `undefined` if the array is empty.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.init([1, 2, 3, 4])) // [1, 2, 3]\nconsole.log(Array.init([])) // undefined';
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
  const result = A.init(input);
  const formattedResult = result === undefined ? "undefined" : `[${result.join(", ")}]`;

  yield* Console.log(`init([${input.join(", ")}]) -> ${formattedResult}`);
});

const exampleEmptyArrayBoundary = Effect.gen(function* () {
  const input: Array<number> = [];
  const result = A.init(input);

  yield* Console.log(`init([]) -> ${result === undefined ? "undefined" : `[${result.join(", ")}]`}`);
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
