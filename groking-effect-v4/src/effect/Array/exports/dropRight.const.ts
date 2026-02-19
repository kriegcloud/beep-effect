/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: dropRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Removes the last `n` elements, creating a new array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dropRight([1, 2, 3, 4, 5], 2)) // [1, 2, 3]
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
const exportName = "dropRight";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Removes the last `n` elements, creating a new array.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.dropRight([1, 2, 3, 4, 5], 2)) // [1, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4, 5];
  const result = A.dropRight(input, 2);
  yield* Console.log(`dropRight([1,2,3,4,5], 2) => ${JSON.stringify(result)}`);
});

const exampleDualAndClampBehavior = Effect.gen(function* () {
  const removeLastTwo = A.dropRight(2);
  const curriedResult = removeLastTwo([1, 2, 3, 4, 5]);
  const dropTooMany = A.dropRight([1, 2, 3], 10);
  const negativeCount = A.dropRight([1, 2, 3], -2);

  yield* Console.log(`dropRight(2)([1,2,3,4,5]) => ${JSON.stringify(curriedResult)}`);
  yield* Console.log(`dropRight([1,2,3], 10) => ${JSON.stringify(dropTooMany)}`);
  yield* Console.log(`dropRight([1,2,3], -2) => ${JSON.stringify(negativeCount)}`);
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
      description: "Drop the last two elements using the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Dual Form and Clamp Behavior",
      description: "Show curried invocation and how n is clamped to array bounds.",
      run: exampleDualAndClampBehavior,
    },
  ],
});

BunRuntime.runMain(program);
