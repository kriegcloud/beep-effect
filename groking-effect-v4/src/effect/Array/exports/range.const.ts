/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: range
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.367Z
 *
 * Overview:
 * Creates a `NonEmptyArray` containing a range of integers, inclusive on both ends.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.range(1, 3)
 * console.log(result) // [1, 2, 3]
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
const exportName = "range";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Creates a `NonEmptyArray` containing a range of integers, inclusive on both ends.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.range(1, 3)\nconsole.log(result) // [1, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const sourceAligned = A.range(1, 3);
  const includesNegatives = A.range(-2, 2);

  yield* Console.log(`A.range(1, 3) => ${JSON.stringify(sourceAligned)}`);
  yield* Console.log(`A.range(-2, 2) => ${JSON.stringify(includesNegatives)}`);
});

const exampleStartGreaterThanEndContract = Effect.gen(function* () {
  const startGreaterThanEnd = A.range(5, 2);
  const sameStartAndEnd = A.range(4, 4);

  yield* Console.log("Contract note: when start > end, Array.range returns [start].");
  yield* Console.log(`A.range(5, 2) => ${JSON.stringify(startGreaterThanEnd)}`);
  yield* Console.log(`A.range(4, 4) => ${JSON.stringify(sameStartAndEnd)}`);
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
      description: "Create an inclusive integer range with the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Start Greater Than End Contract",
      description: "Show the edge behavior where start > end returns a single-element array.",
      run: exampleStartGreaterThanEndContract,
    },
  ],
});

BunRuntime.runMain(program);
