/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Converts an `Iterable` to an `Array`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.fromIterable(new Set([1, 2, 3]))
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
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Converts an `Iterable` to an `Array`.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.fromIterable(new Set([1, 2, 3]))\nconsole.log(result) // [1, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime type and preview for fromIterable.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = new Set([1, 2, 3]);
  const result = A.fromIterable(input);
  yield* Console.log(`fromIterable(Set([1, 2, 3])) => ${JSON.stringify(result)}`);
});

const exampleSingleUseIterator = Effect.gen(function* () {
  function* numbers() {
    yield 10;
    yield 20;
    yield 30;
  }

  const iterator = numbers();
  const firstPass = A.fromIterable(iterator);
  const secondPass = A.fromIterable(iterator);

  yield* Console.log(`first pass from generator => ${JSON.stringify(firstPass)}`);
  yield* Console.log(`second pass on same generator => ${JSON.stringify(secondPass)}`);
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
      description: "Convert a Set to a standard array using the documented call form.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Single-Use Iterator Behavior",
      description: "Show that reusing the same generator after consumption yields an empty array.",
      run: exampleSingleUseIterator,
    },
  ],
});

BunRuntime.runMain(program);
