/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: intersperse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Places a separator element between every pair of elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.intersperse([1, 2, 3], 0)) // [1, 0, 2, 0, 3]
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
const exportName = "intersperse";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Places a separator element between every pair of elements.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.intersperse([1, 2, 3], 0)) // [1, 0, 2, 0, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3];
  const result = A.intersperse(input, 0);

  yield* Console.log(`Array.intersperse([1, 2, 3], 0) => ${JSON.stringify(result)}`);
  yield* Console.log(`input unchanged => ${JSON.stringify(input)}`);
});

const exampleCurriedAndBoundaryInvocation = Effect.gen(function* () {
  const withBar = A.intersperse("|");
  const fromSet = withBar(new Set(["A", "B", "C"]));
  const single = A.intersperse([42], 0);
  const empty = A.intersperse([], 0);

  yield* Console.log(`Array.intersperse("|")(Set("A","B","C")) => ${JSON.stringify(fromSet)}`);
  yield* Console.log(`Array.intersperse([42], 0) => ${JSON.stringify(single)}`);
  yield* Console.log(`Array.intersperse([], 0) => ${JSON.stringify(empty)}`);
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
      description: "Run the documented two-argument call form and show the inserted separator.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable + Boundary Cases",
      description: "Use data-last style on an iterable and show single/empty input behavior.",
      run: exampleCurriedAndBoundaryInvocation,
    },
  ],
});

BunRuntime.runMain(program);
