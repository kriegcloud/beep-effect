/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: findLastIndex
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Returns the index of the last element matching the predicate, or `undefined` if none match.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findLastIndex([1, 3, 8, 9], (x) => x < 5)) // 1
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
const exportName = "findLastIndex";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Returns the index of the last element matching the predicate, or `undefined` if none match.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.findLastIndex([1, 3, 8, 9], (x) => x < 5)) // 1';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect findLastIndex runtime shape.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`findLastIndex.length -> ${A.findLastIndex.length}`);
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const numbers = [1, 3, 8, 9];
  const lastBelowFiveIndex = A.findLastIndex(numbers, (value) => value < 5);
  const matchedValue = lastBelowFiveIndex === undefined ? undefined : numbers[lastBelowFiveIndex];

  yield* Console.log(`numbers: ${formatUnknown(numbers)}`);
  yield* Console.log(`last index where value < 5: ${formatUnknown(lastBelowFiveIndex)}`);
  yield* Console.log(`value at that index: ${formatUnknown(matchedValue)}`);
});

const exampleNoMatchReturnsUndefined = Effect.gen(function* () {
  const temperatures = [31, 35, 29, 33];
  const findLastCriticalTemperature = A.findLastIndex(
    (temperature: unknown): temperature is number => typeof temperature === "number" && temperature >= 80
  );
  const criticalTemperatureIndex = findLastCriticalTemperature(temperatures);

  yield* Console.log(`temperatures: ${formatUnknown(temperatures)}`);
  yield* Console.log(`last index where temperature >= 80: ${formatUnknown(criticalTemperatureIndex)}`);
  yield* Console.log("No matching element returns undefined.");
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
      description: "Inspect export metadata and the function arity exposed at runtime.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Last Match",
      description: "Mirror the JSDoc behavior to locate the last matching index.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried No-Match Behavior",
      description: "Use predicate-first form and show that missing matches return undefined.",
      run: exampleNoMatchReturnsUndefined,
    },
  ],
});

BunRuntime.runMain(program);
