/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: makeBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Creates a `NonEmptyArray` of length `n` where element `i` is computed by `f(i)`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.makeBy(5, (n) => n * 2)
 * console.log(result) // [0, 2, 4, 6, 8]
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
const exportName = "makeBy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Creates a `NonEmptyArray` of length `n` where element `i` is computed by `f(i)`.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.makeBy(5, (n) => n * 2)\nconsole.log(result) // [0, 2, 4, 6, 8]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime type and preview for makeBy.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const result = A.makeBy(5, (n) => n * 2);
  yield* Console.log(`Array.makeBy(5, (n) => n * 2) => [${result.join(", ")}]`);
});

const exampleNormalizedLengthBehavior = Effect.gen(function* () {
  const fractional = A.makeBy(3.7, (i) => i);
  const zero = A.makeBy(0, (i) => i);
  const negative = A.makeBy(-2, (i) => i);

  yield* Console.log(`n = 3.7 -> length ${fractional.length}, values [${fractional.join(", ")}]`);
  yield* Console.log(`n = 0 -> length ${zero.length}, values [${zero.join(", ")}]`);
  yield* Console.log(`n = -2 -> length ${negative.length}, values [${negative.join(", ")}]`);
});

const exampleDualInvocationForms = Effect.gen(function* () {
  const direct = A.makeBy(4, (i) => i * i);
  const curried = A.makeBy((i: number) => i * i)(4);
  const sameValues = JSON.stringify(direct) === JSON.stringify(curried);

  yield* Console.log(`Direct call => [${direct.join(", ")}]`);
  yield* Console.log(`Curried call => [${curried.join(", ")}]`);
  yield* Console.log(`Direct and curried results match: ${sameValues}`);
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
      description: "Run the documented makeBy example and log the generated array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Normalized Length Behavior",
      description: "Show that n is floored and clamped to at least 1 before generation.",
      run: exampleNormalizedLengthBehavior,
    },
    {
      title: "Dual Invocation Forms",
      description: "Compare direct and curried makeBy calls using the same generator.",
      run: exampleDualInvocationForms,
    },
  ],
});

BunRuntime.runMain(program);
