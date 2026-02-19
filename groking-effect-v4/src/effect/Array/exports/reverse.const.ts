/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: reverse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Reverses an iterable into a new array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.reverse([1, 2, 3, 4])) // [4, 3, 2, 1]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "reverse";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Reverses an iterable into a new array.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.reverse([1, 2, 3, 4])) // [4, 3, 2, 1]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4];
  const reversed = A.reverse(input);

  yield* Console.log(`input: ${formatUnknown(input)}`);
  yield* Console.log(`A.reverse(input): ${formatUnknown(reversed)}`);
});

const exampleIterableInput = Effect.gen(function* () {
  const buildStages = new Set(["compile", "test", "package"]);
  const reversedStages = A.reverse(buildStages);

  yield* Console.log(`set iteration order: ${formatUnknown(Array.from(buildStages))}`);
  yield* Console.log(`reversed into array: ${formatUnknown(reversedStages)}`);
});

const exampleNonMutatingBehavior = Effect.gen(function* () {
  const original = ["alpha", "beta", "gamma"];
  const reversed = A.reverse(original);
  reversed[0] = "omega";

  yield* Console.log(`original after reverse: ${formatUnknown(original)}`);
  yield* Console.log(`mutated reversed copy: ${formatUnknown(reversed)}`);
  yield* Console.log("reverse returns a new array and leaves the input unchanged.");
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
      description: "Mirror the JSDoc call shape with a direct reverse of a number array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Reverse Any Iterable",
      description: "Show that reverse accepts generic iterables like Set and returns a new array.",
      run: exampleIterableInput,
    },
    {
      title: "Non-Mutating Behavior",
      description: "Demonstrate that mutating the reversed result does not change the original array.",
      run: exampleNonMutatingBehavior,
    },
  ],
});

BunRuntime.runMain(program);
