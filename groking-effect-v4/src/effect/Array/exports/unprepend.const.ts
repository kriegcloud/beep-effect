/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: unprepend
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Splits a non-empty array into its first element and the remaining elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.unprepend([1, 2, 3, 4])
 * console.log(result) // [1, [2, 3, 4]]
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
const exportName = "unprepend";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Splits a non-empty array into its first element and the remaining elements.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.unprepend([1, 2, 3, 4])\nconsole.log(result) // [1, [2, 3, 4]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`unprepend runtime arity: ${A.unprepend.length}`);
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input: readonly [number, ...number[]] = [1, 2, 3, 4];
  const [head, tail] = A.unprepend(input);
  const recomposed = [head, ...tail];

  yield* Console.log(`unprepend([1, 2, 3, 4]) -> ${JSON.stringify([head, tail])}`);
  yield* Console.log(`recompose with [head, ...tail] -> ${JSON.stringify(recomposed)}`);
});

const exampleSingletonAndGuardedInput = Effect.gen(function* () {
  const singleton = ["only"] as const;
  const [head, tail] = A.unprepend(singleton);
  const maybeEmpty: ReadonlyArray<string> = [];

  yield* Console.log(`unprepend(["only"]) -> ${JSON.stringify([head, tail])}`);
  if (A.isReadonlyArrayNonEmpty(maybeEmpty)) {
    const guarded = A.unprepend(maybeEmpty);
    yield* Console.log(`guarded unprepend on non-empty input -> ${JSON.stringify(guarded)}`);
  } else {
    yield* Console.log("Contract note: unprepend requires a non-empty array; guard uncertain inputs first.");
  }
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
      description: "Inspect runtime shape metadata and callable arity for unprepend.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Split a non-empty array into head + tail using the documented call pattern.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Singleton + Contract Guard",
      description: "Show singleton behavior and guard possibly-empty inputs before calling unprepend.",
      run: exampleSingletonAndGuardedInput,
    },
  ],
});

BunRuntime.runMain(program);
