/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: prepend
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.367Z
 *
 * Overview:
 * Adds a single element to the front of an iterable, returning a `NonEmptyArray`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.prepend([2, 3, 4], 1)
 * console.log(result) // [1, 2, 3, 4]
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
const exportName = "prepend";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Adds a single element to the front of an iterable, returning a `NonEmptyArray`.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.prepend([2, 3, 4], 1)\nconsole.log(result) // [1, 2, 3, 4]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [2, 3, 4];
  const result = A.prepend(input, 1);

  yield* Console.log(`prepend([2, 3, 4], 1) => ${JSON.stringify(result)}`);
  yield* Console.log(`original input remains ${JSON.stringify(input)}`);
});

const exampleCurriedIterableInvocation = Effect.gen(function* () {
  const prependTitle = A.prepend("intro");
  const result = prependTitle(new Set(["verse", "chorus"]));
  const prependedToEmpty = A.prepend(9)([]);

  yield* Console.log(`prepend("intro")(Set("verse", "chorus")) => ${JSON.stringify(result)}`);
  yield* Console.log(`prepend(9)([]) => ${JSON.stringify(prependedToEmpty)}`);
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
      description: "Mirror the JSDoc call shape by prepending one value to an existing array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable Invocation",
      description: "Use data-last style with iterable input and show the non-empty result on empty arrays.",
      run: exampleCurriedIterableInvocation,
    },
  ],
});

BunRuntime.runMain(program);
