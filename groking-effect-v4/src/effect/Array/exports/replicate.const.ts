/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: replicate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Creates a `NonEmptyArray` containing a value repeated `n` times.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.replicate("a", 3)
 * console.log(result) // ["a", "a", "a"]
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
const exportName = "replicate";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Creates a `NonEmptyArray` containing a value repeated `n` times.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.replicate("a", 3)\nconsole.log(result) // ["a", "a", "a"]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime type and preview for Array.replicate.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const result = A.replicate("a", 3);

  yield* Console.log(`Array.replicate("a", 3) => ${JSON.stringify(result)}`);
  yield* Console.log(`Result length: ${result.length}`);
});

const exampleDualInvocationForms = Effect.gen(function* () {
  const direct = A.replicate("beep", 3);
  const curried = A.replicate(3)("beep");
  const sameValues = JSON.stringify(direct) === JSON.stringify(curried);

  yield* Console.log(`Direct call => ${JSON.stringify(direct)}`);
  yield* Console.log(`Curried call => ${JSON.stringify(curried)}`);
  yield* Console.log(`Direct and curried results match: ${sameValues}`);
});

const exampleNormalizedCountBehavior = Effect.gen(function* () {
  const fractional = A.replicate("x", 2.7);
  const zero = A.replicate("x", 0);
  const negative = A.replicate("x", -4);

  yield* Console.log(`n = 2.7 -> ${JSON.stringify(fractional)} (length ${fractional.length})`);
  yield* Console.log(`n = 0 -> ${JSON.stringify(zero)} (length ${zero.length})`);
  yield* Console.log(`n = -4 -> ${JSON.stringify(negative)} (length ${negative.length})`);
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
      description: "Run the documented call and confirm the repeated non-empty result.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Dual Invocation Forms",
      description: "Compare direct and curried calls to verify both invocation styles.",
      run: exampleDualInvocationForms,
    },
    {
      title: "Normalized Count Behavior",
      description: "Show that n is floored and clamped to at least 1 before replication.",
      run: exampleNormalizedCountBehavior,
    },
  ],
});

BunRuntime.runMain(program);
