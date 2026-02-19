/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: appendAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.346Z
 *
 * Overview:
 * Concatenates two iterables into a single array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.appendAll([1, 2], [3, 4])
 * console.log(result) // [1, 2, 3, 4]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "appendAll";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Concatenates two iterables into a single array.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.appendAll([1, 2], [3, 4])\nconsole.log(result) // [1, 2, 3, 4]';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedConcatenation = Effect.gen(function* () {
  const left = [1, 2];
  const right = [3, 4];
  const combined = A.appendAll(left, right);

  yield* Console.log(`appendAll([1, 2], [3, 4]) -> [${combined.join(", ")}]`);
  yield* Console.log(`inputs unchanged -> left:[${left.join(", ")}] right:[${right.join(", ")}]`);
});

const exampleCurriedIterableConcatenation = Effect.gen(function* () {
  const streamStages = new Set(["boot", "sync"]);
  const appendShutdownStages = A.appendAll(["flush", "shutdown"]);
  const fullPlan = appendShutdownStages(streamStages);

  yield* Console.log(`curried Set + Array -> [${fullPlan.join(" -> ")}]`);
  yield* Console.log(`result length -> ${fullPlan.length}`);
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
      title: "Source-Aligned Concatenation",
      description: "Concatenate two arrays with the same call shape shown in the source JSDoc example.",
      run: exampleSourceAlignedConcatenation,
    },
    {
      title: "Curried Iterable Concatenation",
      description: "Use curried appendAll to combine a Set and an Array into a single Array result.",
      run: exampleCurriedIterableConcatenation,
    },
  ],
});

BunRuntime.runMain(program);
