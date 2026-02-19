/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Transforms each element using a function, returning a new array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.map([1, 2, 3], (x) => x * 2)) // [2, 4, 6]
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Transforms each element using a function, returning a new array.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.map([1, 2, 3], (x) => x * 2)) // [2, 4, 6]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3];
  const result = A.map(input, (x) => x * 2);

  yield* Console.log(`A.map([1, 2, 3], x => x * 2) => ${JSON.stringify(result)}`);
  yield* Console.log(`input remains ${JSON.stringify(input)}`);
});

const exampleCurriedIndexAwareInvocation = Effect.gen(function* () {
  const labelWithIndex = A.map((word: string, index) => `${index}:${word.toUpperCase()}`);
  const result = labelWithIndex(["beep", "boop", "bop"]);

  yield* Console.log(
    `A.map((word, index) => \`\${index}:\${word.toUpperCase()}\`)(["beep","boop","bop"]) => ${JSON.stringify(result)}`
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
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Map numbers with the documented call shape and show original input remains unchanged.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Index-Aware Invocation",
      description: "Use the data-last form and include callback index in each mapped output.",
      run: exampleCurriedIndexAwareInvocation,
    },
  ],
});

BunRuntime.runMain(program);
