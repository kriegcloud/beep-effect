/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: difference
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Computes elements in the first array that are not in the second, using `Equal.equivalence()`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.difference([1, 2, 3], [2, 3, 4])) // [1]
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
const exportName = "difference";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Computes elements in the first array that are not in the second, using `Equal.equivalence()`.";
const sourceExample = 'import { Array } from "effect"\n\nconsole.log(Array.difference([1, 2, 3], [2, 3, 4])) // [1]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export to confirm runtime shape before calling it.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedDifference = Effect.gen(function* () {
  const baseline = A.difference([1, 2, 3], [2, 3, 4]);
  const noOverlap = A.difference([1, 2], [7, 8]);

  yield* Console.log(`difference([1, 2, 3], [2, 3, 4]) -> [${baseline.join(", ")}]`);
  yield* Console.log(`difference([1, 2], [7, 8]) -> [${noOverlap.join(", ")}]`);
});

const exampleCurriedDifference = Effect.gen(function* () {
  const blockedTags = ["beta", "deprecated"];
  const removeBlockedTags = A.difference(blockedTags);
  const releaseTags = ["stable", "beta", "v1", "deprecated"];
  const filtered = removeBlockedTags(releaseTags);

  yield* Console.log(`difference(["beta","deprecated"])(releaseTags) -> [${filtered.join(", ")}]`);
  yield* Console.log(`releaseTags unchanged -> [${releaseTags.join(", ")}]`);
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
      title: "Source-Aligned Difference",
      description: "Use the two-argument form from the source example and contrast with a no-overlap case.",
      run: exampleSourceAlignedDifference,
    },
    {
      title: "Curried Difference",
      description: "Use the curried form to remove blocked tags while leaving the original array unchanged.",
      run: exampleCurriedDifference,
    },
  ],
});

BunRuntime.runMain(program);
