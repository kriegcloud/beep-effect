/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: matchLeft
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Pattern-matches on an array from the left, providing the first element and the remaining elements separately.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const matchLeft = Array.matchLeft({
 *   onEmpty: () => "empty",
 *   onNonEmpty: (head, tail) => `head: ${head}, tail: ${tail.length}`
 * })
 * console.log(matchLeft([])) // "empty"
 * console.log(matchLeft([1, 2, 3])) // "head: 1, tail: 2"
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
const exportName = "matchLeft";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Pattern-matches on an array from the left, providing the first element and the remaining elements separately.";
const sourceExample =
  'import { Array } from "effect"\n\nconst matchLeft = Array.matchLeft({\n  onEmpty: () => "empty",\n  onNonEmpty: (head, tail) => `head: ${head}, tail: ${tail.length}`\n})\nconsole.log(matchLeft([])) // "empty"\nconsole.log(matchLeft([1, 2, 3])) // "head: 1, tail: 2"';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Array.matchLeft as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedHeadTail = Effect.gen(function* () {
  yield* Console.log("Use matchLeft to branch between empty and head/tail cases.");
  const describe = A.matchLeft({
    onEmpty: () => "empty",
    onNonEmpty: (head: number, tail: Array<number>) => `head: ${head}, tail: ${tail.length}`,
  });

  const emptyInput = describe([]);
  const nonEmptyInput = describe([1, 2, 3]);

  yield* Console.log(`describe([]) -> ${formatUnknown(emptyInput)}`);
  yield* Console.log(`describe([1, 2, 3]) -> ${formatUnknown(nonEmptyInput)}`);
});

const exampleDataFirstOverload = Effect.gen(function* () {
  yield* Console.log("Use the data-first overload when the array is already available.");
  const handlers = {
    onEmpty: () => "queue is empty",
    onNonEmpty: (head: string, tail: Array<string>) =>
      `next: ${head}; remaining: ${tail.length === 0 ? "(none)" : tail.join(", ")}`,
  } as const;

  const emptyQueue = A.matchLeft([] as ReadonlyArray<string>, handlers);
  const busyQueue = A.matchLeft(["build", "test", "deploy"], handlers);

  yield* Console.log(`matchLeft([], handlers) -> ${formatUnknown(emptyQueue)}`);
  yield* Console.log(`matchLeft(["build", "test", "deploy"], handlers) -> ${formatUnknown(busyQueue)}`);
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
      title: "Source-Aligned Head/Tail Matching",
      description: "Reproduce the documented behavior for empty and non-empty arrays.",
      run: exampleSourceAlignedHeadTail,
    },
    {
      title: "Data-First Overload",
      description: "Call matchLeft directly with an input array and handler object.",
      run: exampleDataFirstOverload,
    },
  ],
});

BunRuntime.runMain(program);
