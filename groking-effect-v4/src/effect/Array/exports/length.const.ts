/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: length
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Returns the number of elements in a `ReadonlyArray`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.length([1, 2, 3])) // 3
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
const exportName = "length";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns the number of elements in a `ReadonlyArray`.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.length([1, 2, 3])) // 3';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime type and preview for length.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const values = [1, 2, 3];
  const result = A.length(values);
  yield* Console.log(`Array.length([1, 2, 3]) => ${result}`);
});

const exampleReadonlyAndEmptyInputs = Effect.gen(function* () {
  const empty: ReadonlyArray<number> = [];
  const readonlyTuple = ["north", "south", "east", "west"] as const;

  yield* Console.log(`Array.length([]) => ${A.length(empty)}`);
  yield* Console.log(`Array.length(["north", "south", "east", "west"] as const) => ${A.length(readonlyTuple)}`);
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
      description: "Run the documented length call and log the resulting element count.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Readonly and Empty Inputs",
      description: "Show that empty arrays and readonly tuples both return deterministic counts.",
      run: exampleReadonlyAndEmptyInputs,
    },
  ],
});

BunRuntime.runMain(program);
