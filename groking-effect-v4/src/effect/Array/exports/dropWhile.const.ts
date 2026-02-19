/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: dropWhile
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Drops elements from the start while the predicate holds, returning the rest.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dropWhile([1, 2, 3, 4, 5], (x) => x < 4)) // [4, 5]
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
const exportName = "dropWhile";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Drops elements from the start while the predicate holds, returning the rest.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.dropWhile([1, 2, 3, 4, 5], (x) => x < 4)) // [4, 5]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime type and preview for the dropWhile export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedDrop = Effect.gen(function* () {
  const input = [1, 2, 3, 4, 5];
  const result = A.dropWhile(input, (n) => n < 4);
  yield* Console.log(`A.dropWhile([1, 2, 3, 4, 5], n < 4) => ${JSON.stringify(result)}`);
  yield* Console.log(`Expected prefix drop result: ${JSON.stringify([4, 5])}`);
});

const exampleLeadingOnlyBehavior = Effect.gen(function* () {
  const input = [1, 2, 4, 1, 2];
  const result = A.dropWhile(input, (n) => n < 3);
  yield* Console.log(`A.dropWhile([1, 2, 4, 1, 2], n < 3) => ${JSON.stringify(result)}`);
  yield* Console.log("After the first non-match (4), remaining values are kept as-is.");
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
      title: "Source-Aligned Prefix Drop",
      description: "Replicate the documented threshold example with concrete output.",
      run: exampleSourceAlignedDrop,
    },
    {
      title: "Leading Segment Only",
      description: "Show that dropping stops at the first predicate failure.",
      run: exampleLeadingOnlyBehavior,
    },
  ],
});

BunRuntime.runMain(program);
