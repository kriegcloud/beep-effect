/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: matchRight
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Pattern-matches on an array from the right, providing all elements except the last and the last element separately.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const matchRight = Array.matchRight({
 *   onEmpty: () => "empty",
 *   onNonEmpty: (init, last) => `init: ${init.length}, last: ${last}`
 * })
 * console.log(matchRight([])) // "empty"
 * console.log(matchRight([1, 2, 3])) // "init: 2, last: 3"
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
const exportName = "matchRight";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Pattern-matches on an array from the right, providing all elements except the last and the last element separately.";
const sourceExample =
  'import { Array } from "effect"\n\nconst matchRight = Array.matchRight({\n  onEmpty: () => "empty",\n  onNonEmpty: (init, last) => `init: ${init.length}, last: ${last}`\n})\nconsole.log(matchRight([])) // "empty"\nconsole.log(matchRight([1, 2, 3])) // "init: 2, last: 3"';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const describe = A.matchRight({
    onEmpty: () => "empty",
    onNonEmpty: (init: ReadonlyArray<number>, last: number) => `init: ${init.length}, last: ${last}`,
  });

  yield* Console.log(`matchRight([]) => ${describe([])}`);
  yield* Console.log(`matchRight([1, 2, 3]) => ${describe([1, 2, 3])}`);
});

const exampleDataFirstInvocation = Effect.gen(function* () {
  const input = ["beep", "boop", "bop"];
  const result = A.matchRight(input, {
    onEmpty: () => "no values",
    onNonEmpty: (init, last) => `last=${last}; init=${init.join("|")}`,
  });
  const singleton = A.matchRight(["solo"], {
    onEmpty: () => "no values",
    onNonEmpty: (init, last) => `last=${last}; init-size=${init.length}`,
  });

  yield* Console.log(`A.matchRight(["beep","boop","bop"], ...) => ${result}`);
  yield* Console.log(`A.matchRight(["solo"], ...) => ${singleton}`);
  yield* Console.log(`input remains ${JSON.stringify(input)}`);
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
      description: "Use the documented onEmpty / onNonEmpty handlers with empty and non-empty inputs.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Data-First Invocation",
      description: "Use the data-first overload and show how init/last behave for multi-item and singleton arrays.",
      run: exampleDataFirstInvocation,
    },
  ],
});

BunRuntime.runMain(program);
