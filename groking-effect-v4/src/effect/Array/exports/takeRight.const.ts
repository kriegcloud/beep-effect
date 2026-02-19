/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: takeRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.370Z
 *
 * Overview:
 * Keeps the last `n` elements, creating a new array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.takeRight([1, 2, 3, 4, 5], 3)) // [3, 4, 5]
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
const exportName = "takeRight";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Keeps the last `n` elements, creating a new array.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.takeRight([1, 2, 3, 4, 5], 3)) // [3, 4, 5]';
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
  const result = A.takeRight(input, 3);

  yield* Console.log(`A.takeRight([1, 2, 3, 4, 5], 3) => ${JSON.stringify(result)}`);
  yield* Console.log(`original input remains ${JSON.stringify(input)}`);
});

const exampleCurriedAndBoundaryInvocation = Effect.gen(function* () {
  const fromSet = A.takeRight(2)(new Set([10, 20, 30, 40]));
  const takesAll = A.takeRight([1, 2], 5);
  const takesNone = A.takeRight([1, 2], 0);

  yield* Console.log(`A.takeRight(2)(Set(10, 20, 30, 40)) => ${JSON.stringify(fromSet)}`);
  yield* Console.log(`A.takeRight([1, 2], 5) => ${JSON.stringify(takesAll)}`);
  yield* Console.log(`A.takeRight([1, 2], 0) => ${JSON.stringify(takesNone)}`);
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
      description: "Mirror the JSDoc form and keep the last three values from an input array.",
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
