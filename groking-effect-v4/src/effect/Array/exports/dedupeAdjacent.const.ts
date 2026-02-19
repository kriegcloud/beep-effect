/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: dedupeAdjacent
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Removes consecutive duplicate elements using `Equal.equivalence()`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dedupeAdjacent([1, 1, 2, 2, 3, 3])) // [1, 2, 3]
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
const exportName = "dedupeAdjacent";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Removes consecutive duplicate elements using `Equal.equivalence()`.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.dedupeAdjacent([1, 1, 2, 2, 3, 3])) // [1, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 1, 2, 2, 3, 3];
  const result = A.dedupeAdjacent(input);
  yield* Console.log(`dedupeAdjacent([1, 1, 2, 2, 3, 3]) => ${JSON.stringify(result)}`);
  yield* Console.log(`original input remains ${JSON.stringify(input)}`);
});

const exampleNonAdjacentContrast = Effect.gen(function* () {
  const input = [1, 2, 1, 2, 2, 3, 3, 2];
  const result = A.dedupeAdjacent(input);
  yield* Console.log(`dedupeAdjacent([1, 2, 1, 2, 2, 3, 3, 2]) => ${JSON.stringify(result)}`);
  yield* Console.log("Only adjacent runs are collapsed; earlier duplicates are preserved.");
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
      description: "Remove adjacent duplicates using the documented example input.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Non-Adjacent Duplicate Contrast",
      description: "Show that only consecutive duplicates are removed.",
      run: exampleNonAdjacentContrast,
    },
  ],
});

BunRuntime.runMain(program);
