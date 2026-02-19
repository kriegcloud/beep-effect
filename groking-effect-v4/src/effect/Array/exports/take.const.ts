/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: take
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.369Z
 *
 * Overview:
 * Keeps the first `n` elements, creating a new array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.take([1, 2, 3, 4, 5], 3)) // [1, 2, 3]
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
const exportName = "take";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Keeps the first `n` elements, creating a new array.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.take([1, 2, 3, 4, 5], 3)) // [1, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4, 5];
  const firstThree = A.take(input, 3);

  yield* Console.log(`A.take([1, 2, 3, 4, 5], 3) => ${JSON.stringify(firstThree)}`);
  yield* Console.log(`original input remains ${JSON.stringify(input)}`);
});

const exampleCurriedAndBoundaryInvocation = Effect.gen(function* () {
  const fromSet = A.take(2)(new Set([10, 20, 30, 40]));
  const takesAll = A.take([1, 2], 5);
  const takesNone = A.take([1, 2], 0);

  yield* Console.log(`A.take(2)(Set(10, 20, 30, 40)) => ${JSON.stringify(fromSet)}`);
  yield* Console.log(`A.take([1, 2], 5) => ${JSON.stringify(takesAll)}`);
  yield* Console.log(`A.take([1, 2], 0) => ${JSON.stringify(takesNone)}`);
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
      description: "Mirror the JSDoc form and keep the first three values from an input array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable + Boundary Case",
      description: "Use data-last style on an iterable and show behavior for larger and zero limits.",
      run: exampleCurriedAndBoundaryInvocation,
    },
  ],
});

BunRuntime.runMain(program);
