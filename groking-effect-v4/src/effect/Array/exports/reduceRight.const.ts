/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: reduceRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Folds an iterable from right to left into a single value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.reduceRight([1, 2, 3], 0, (acc, n) => acc + n)) // 6
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
const exportName = "reduceRight";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Folds an iterable from right to left into a single value.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.reduceRight([1, 2, 3], 0, (acc, n) => acc + n)) // 6';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const total = A.reduceRight([1, 2, 3], 0, (acc, n) => acc + n);
  yield* Console.log(`Array.reduceRight([1, 2, 3], 0, (acc, n) => acc + n) => ${total}`);
});

const exampleCurriedOrderAndIndex = Effect.gen(function* () {
  const steps: Array<string> = [];
  const foldRight = A.reduceRight("", (acc: string, value: string, index: number) => {
    steps.push(`${index}:${value}`);
    return `${acc}${value}`;
  });
  const result = foldRight(["a", "b", "c"]);

  yield* Console.log(`Traversal order (index:value) => ${steps.join(" -> ")}`);
  yield* Console.log(`Curried fold result => ${result}`);
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
      description: "Run the documented right-to-left numeric fold and log the total.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Order + Index",
      description: "Use data-last style and capture right-to-left traversal with callback indexes.",
      run: exampleCurriedOrderAndIndex,
    },
  ],
});

BunRuntime.runMain(program);
