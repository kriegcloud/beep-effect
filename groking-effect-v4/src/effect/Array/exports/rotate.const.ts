/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: rotate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Rotates an array by `n` steps. Positive `n` rotates left (front elements move to the back).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.rotate(["a", "b", "c", "d"], 2)) // ["c", "d", "a", "b"]
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
const exportName = "rotate";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Rotates an array by `n` steps. Positive `n` rotates left (front elements move to the back).";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.rotate(["a", "b", "c", "d"], 2)) // ["c", "d", "a", "b"]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime type and preview for rotate.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedRotation = Effect.gen(function* () {
  const rotatedLeft = A.rotate(["a", "b", "c", "d"], 2);
  const rotatedRight = A.rotate(["a", "b", "c", "d"], -1);

  yield* Console.log(`Array.rotate(["a", "b", "c", "d"], 2) => ${JSON.stringify(rotatedLeft)}`);
  yield* Console.log(`Array.rotate(["a", "b", "c", "d"], -1) => ${JSON.stringify(rotatedRight)}`);
});

const exampleCurriedAndCopyBehavior = Effect.gen(function* () {
  const rotateByThree = A.rotate(3);
  const cycled = rotateByThree([1, 2, 3, 4, 5]);

  const original = [10, 20, 30];
  const zeroStep = A.rotate(original, 0);

  yield* Console.log(`Array.rotate(3)([1, 2, 3, 4, 5]) => ${JSON.stringify(cycled)}`);
  yield* Console.log(`Array.rotate([10, 20, 30], 0) => ${JSON.stringify(zeroStep)}`);
  yield* Console.log(`n=0 returns a copy => ${zeroStep !== original}`);
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
      title: "Source-Aligned Rotation",
      description: "Run direct calls with positive and negative steps to show left and right rotation.",
      run: exampleSourceAlignedRotation,
    },
    {
      title: "Curried Form and Copy Behavior",
      description: "Use the curried API and confirm zero-step rotation returns a copy.",
      run: exampleCurriedAndCopyBehavior,
    },
  ],
});

BunRuntime.runMain(program);
