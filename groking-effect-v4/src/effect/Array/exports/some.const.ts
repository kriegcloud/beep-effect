/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: some
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Tests whether at least one element satisfies the predicate. Narrows the type to `NonEmptyReadonlyArray` on success.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.some([1, 3, 4], (x) => x % 2 === 0)) // true
 * console.log(Array.some([1, 3, 5], (x) => x % 2 === 0)) // false
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
const exportName = "some";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Tests whether at least one element satisfies the predicate. Narrows the type to `NonEmptyReadonlyArray` on success.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.some([1, 3, 4], (x) => x % 2 === 0)) // true\nconsole.log(Array.some([1, 3, 5], (x) => x % 2 === 0)) // false';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const hasEven = A.some([1, 3, 4], (x) => x % 2 === 0);
  const allOdd = A.some([1, 3, 5], (x) => x % 2 === 0);
  yield* Console.log(`some([1, 3, 4], isEven) => ${hasEven}`);
  yield* Console.log(`some([1, 3, 5], isEven) => ${allOdd}`);
});

const exampleCurriedShortCircuit = Effect.gen(function* () {
  const readings = [12, 15, 22, 9, 30];
  let callsUntilFirstMatch = 0;
  const isCritical = (value: unknown) => {
    const numeric = typeof value === "number" ? value : Number(value);
    callsUntilFirstMatch += 1;
    return numeric > 20;
  };
  const hasCriticalReading = A.some(isCritical)(readings);
  let stablePredicateCalls = 0;
  const isCriticalStable = (value: unknown) => {
    const numeric = typeof value === "number" ? value : Number(value);
    stablePredicateCalls += 1;
    return numeric > 20;
  };
  const stableReadings = A.some(isCriticalStable)([5, 7, 9]);
  yield* Console.log(`A.some(isCritical)([12, 15, 22, 9, 30]) => ${hasCriticalReading}`);
  yield* Console.log(`predicate evaluated ${callsUntilFirstMatch} element(s) before first match`);
  yield* Console.log(`A.some(isCritical)([5, 7, 9]) => ${stableReadings}`);
  yield* Console.log(`predicate evaluated ${stablePredicateCalls} element(s) when no match exists`);
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
      description: "Mirror the documented parity checks and observe true/false outcomes.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Short-Circuit Behavior",
      description: "Use the data-last form and show predicate calls stop after the first match.",
      run: exampleCurriedShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
