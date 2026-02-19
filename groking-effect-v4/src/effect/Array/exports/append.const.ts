/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: append
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.345Z
 *
 * Overview:
 * Adds a single element to the end of an iterable, returning a `NonEmptyArray`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.append([1, 2, 3], 4)
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
const exportName = "append";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Adds a single element to the end of an iterable, returning a `NonEmptyArray`.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.append([1, 2, 3], 4)\nconsole.log(result) // [1, 2, 3, 4]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3];
  const result = A.append(input, 4);
  yield* Console.log(`append([1, 2, 3], 4) => ${JSON.stringify(result)}`);
  yield* Console.log(`original input remains ${JSON.stringify(input)}`);
});

const exampleCurriedInvocation = Effect.gen(function* () {
  const appendExclamation = A.append("!");
  const result = appendExclamation(new Set(["a", "b"]));
  yield* Console.log(`append("!")(Set("a", "b")) => ${JSON.stringify(result)}`);
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
      description: "Append one element to an array using the documented two-argument form.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable Invocation",
      description: "Use data-last style to append to any iterable input.",
      run: exampleCurriedInvocation,
    },
  ],
});

BunRuntime.runMain(program);
