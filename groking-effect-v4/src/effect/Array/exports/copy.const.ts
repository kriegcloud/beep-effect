/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: copy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.347Z
 *
 * Overview:
 * Creates a shallow copy of an array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const original = [1, 2, 3]
 * const copied = Array.copy(original)
 * console.log(copied) // [1, 2, 3]
 * console.log(original === copied) // false
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
const exportName = "copy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Creates a shallow copy of an array.";
const sourceExample =
  'import { Array } from "effect"\n\nconst original = [1, 2, 3]\nconst copied = Array.copy(original)\nconsole.log(copied) // [1, 2, 3]\nconsole.log(original === copied) // false';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedCopy = Effect.gen(function* () {
  const original = [1, 2, 3];
  const copied = A.copy(original);

  yield* Console.log(`copy([1, 2, 3]) => ${JSON.stringify(copied)}`);
  yield* Console.log(`original === copied -> ${original === copied}`);
});

const exampleShallowCopyBehavior = Effect.gen(function* () {
  const original = [
    { id: 1, tags: ["a"] },
    { id: 2, tags: ["b"] },
  ];
  const copied = A.copy(original);

  copied.push({ id: 3, tags: ["c"] });
  copied[0]?.tags.push("shared");

  yield* Console.log(`after copied.push(...): original length=${original.length}, copied length=${copied.length}`);
  yield* Console.log(`copied[0] shares reference with original[0] -> ${copied[0] === original[0]}`);
  yield* Console.log(`original[0].tags => ${JSON.stringify(original[0]?.tags)}`);
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
      title: "Source-Aligned Copy",
      description: "Copy a basic array and confirm the returned array is a new reference.",
      run: exampleSourceAlignedCopy,
    },
    {
      title: "Shallow Copy Behavior",
      description: "Show that top-level array structure is copied while nested object references are shared.",
      run: exampleShallowCopyBehavior,
    },
  ],
});

BunRuntime.runMain(program);
