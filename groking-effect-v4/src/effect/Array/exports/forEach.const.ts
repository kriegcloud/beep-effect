/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: forEach
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Runs a side-effect for each element. The callback receives `(element, index)`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * Array.forEach([1, 2, 3], (n) => console.log(n)) // 1, 2, 3
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
const exportName = "forEach";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Runs a side-effect for each element. The callback receives `(element, index)`.";
const sourceExample = 'import { Array } from "effect"\n\nArray.forEach([1, 2, 3], (n) => console.log(n)) // 1, 2, 3';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleDataFirstInvocation = Effect.gen(function* () {
  const values = [1, 2, 3];
  const visited: Array<string> = [];

  const result = A.forEach(values, (value, index) => {
    visited.push(`${index}:${value}`);
  });

  yield* Console.log(`Input: ${JSON.stringify(values)}`);
  yield* Console.log(`Visited (index:value): ${visited.join(", ")}`);
  yield* Console.log(`Returns undefined: ${result === undefined}`);
});

const exampleDataLastInvocation = Effect.gen(function* () {
  const words = ["effect", "array", "forEach"];
  const visited: Array<string> = [];

  const runForEach = A.forEach((word: string, index: number) => {
    visited.push(`${index}:${word.toUpperCase()}`);
  });
  const result = runForEach(words);

  yield* Console.log(`Input: ${JSON.stringify(words)}`);
  yield* Console.log(`Curried callback output: ${visited.join(", ")}`);
  yield* Console.log(`Returns undefined: ${result === undefined}`);
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
      title: "Data-First Iteration",
      description: "Runs a side-effect for each element and shows callback index/value pairs.",
      run: exampleDataFirstInvocation,
    },
    {
      title: "Data-Last (Curried) Iteration",
      description: "Uses the curried form so forEach can be prepared before providing the array.",
      run: exampleDataLastInvocation,
    },
  ],
});

BunRuntime.runMain(program);
