/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: modifyHeadNonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.362Z
 *
 * Overview:
 * Applies a function to the first element of a non-empty array, returning a new array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.modifyHeadNonEmpty([1, 2, 3], (n) => n * 10)) // [10, 2, 3]
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
const exportName = "modifyHeadNonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Applies a function to the first element of a non-empty array, returning a new array.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.modifyHeadNonEmpty([1, 2, 3], (n) => n * 10)) // [10, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata for the exported value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input: [number, ...Array<number>] = [1, 2, 3];
  const updated = A.modifyHeadNonEmpty(input, (n) => n * 10);
  yield* Console.log(`input=${JSON.stringify(input)}`);
  yield* Console.log(`modifyHeadNonEmpty(..., n => n * 10) -> ${JSON.stringify(updated)}`);
});

const exampleHeadOnlyUpdate = Effect.gen(function* () {
  const input: [string, ...Array<string>] = ["alpha", "beta", "gamma"];
  const updated = A.modifyHeadNonEmpty(input, (head) => head.toUpperCase());
  const tailUnchanged = JSON.stringify(input.slice(1)) === JSON.stringify(updated.slice(1));
  yield* Console.log(`original=${JSON.stringify(input)}`);
  yield* Console.log(`updated=${JSON.stringify(updated)}`);
  yield* Console.log(`tail unchanged=${tailUnchanged}; same reference=${Object.is(input, updated)}`);
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
      description: "Apply the documented numeric transformation to the first element of a non-empty array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Head-Only Modification",
      description: "Show that only the head changes while the tail values stay the same.",
      run: exampleHeadOnlyUpdate,
    },
  ],
});

BunRuntime.runMain(program);
