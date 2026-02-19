/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: every
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Tests whether all elements satisfy the predicate. Supports refinements for type narrowing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.every([2, 4, 6], (x) => x % 2 === 0)) // true
 * console.log(Array.every([2, 3, 6], (x) => x % 2 === 0)) // false
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
const exportName = "every";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Tests whether all elements satisfy the predicate. Supports refinements for type narrowing.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.every([2, 4, 6], (x) => x % 2 === 0)) // true\nconsole.log(Array.every([2, 3, 6], (x) => x % 2 === 0)) // false';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const allEven = A.every([2, 4, 6], (n) => n % 2 === 0);
  const mixedParity = A.every([2, 3, 6], (n) => n % 2 === 0);
  yield* Console.log(`every([2, 4, 6], isEven) => ${allEven}`);
  yield* Console.log(`every([2, 3, 6], isEven) => ${mixedParity}`);
});

const exampleEarlyExitBehavior = Effect.gen(function* () {
  const input = [10, 20, -1, 30];
  let predicateCalls = 0;
  const allPositive = A.every(input, (n) => {
    predicateCalls += 1;
    return n > 0;
  });
  yield* Console.log(`every([10, 20, -1, 30], n > 0) => ${allPositive}`);
  yield* Console.log(`predicate evaluated ${predicateCalls} element(s) before stopping`);
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
      description: "Run the documented parity checks and observe true/false outcomes.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Short-Circuit Predicate Behavior",
      description: "Show that evaluation stops once a failing element is found.",
      run: exampleEarlyExitBehavior,
    },
  ],
});

BunRuntime.runMain(program);
