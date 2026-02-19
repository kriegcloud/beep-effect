/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: pad
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.367Z
 *
 * Overview:
 * Pads or truncates an array to exactly `n` elements, filling with `fill` if the array is shorter, or slicing if longer.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.pad([1, 2, 3], 6, 0)) // [1, 2, 3, 0, 0, 0]
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
const exportName = "pad";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Pads or truncates an array to exactly `n` elements, filling with `fill` if the array is shorter, or slicing if longer.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.pad([1, 2, 3], 6, 0)) // [1, 2, 3, 0, 0, 0]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape and preview for Array.pad.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const padded = A.pad([1, 2, 3], 6, 0);
  const truncated = A.pad([1, 2, 3, 4], 2, 0);

  yield* Console.log(`Array.pad([1, 2, 3], 6, 0) => ${JSON.stringify(padded)}`);
  yield* Console.log(`Array.pad([1, 2, 3, 4], 2, 0) => ${JSON.stringify(truncated)}`);
});

const exampleCurriedAndEdgeCases = Effect.gen(function* () {
  const padTo5WithX = A.pad(5, "x");
  const short = padTo5WithX(["a", "b"]);
  const long = padTo5WithX(["a", "b", "c", "d", "e", "f"]);
  const zeroTarget = A.pad([9, 8, 7], 0, 0);

  yield* Console.log(`Array.pad(5, "x")(["a", "b"]) => ${JSON.stringify(short)}`);
  yield* Console.log(`Array.pad(5, "x")(["a", "b", "c", "d", "e", "f"]) => ${JSON.stringify(long)}`);
  yield* Console.log(`Array.pad([9, 8, 7], 0, 0) => ${JSON.stringify(zeroTarget)}`);
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
      description: "Mirror the documented call shape and show both padding and truncation behavior.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Form and n<=0",
      description: "Use the data-last form and confirm the empty-array result when target length is not positive.",
      run: exampleCurriedAndEdgeCases,
    },
  ],
});

BunRuntime.runMain(program);
