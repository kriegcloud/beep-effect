/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: prependAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.367Z
 *
 * Overview:
 * Prepends all elements from a prefix iterable to the front of an array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.prependAll([2, 3], [0, 1])
 * console.log(result) // [0, 1, 2, 3]
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
const exportName = "prependAll";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Prepends all elements from a prefix iterable to the front of an array.";
const sourceExample =
  'import { Array } from "effect"\n\nconst result = Array.prependAll([2, 3], [0, 1])\nconsole.log(result) // [0, 1, 2, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const original = [2, 3];
  const prefix = [0, 1];
  const result = A.prependAll(original, prefix);

  yield* Console.log(`prependAll([2, 3], [0, 1]) => ${JSON.stringify(result)}`);
  yield* Console.log(`inputs unchanged => original=${JSON.stringify(original)}, prefix=${JSON.stringify(prefix)}`);
});

const exampleCurriedIterableInvocation = Effect.gen(function* () {
  const prependFlags = A.prependAll(["--verbose", "--dry-run"]);
  const result = prependFlags(new Set(["build", "watch"]));

  yield* Console.log(`prependAll(["--verbose", "--dry-run"])(Set("build", "watch")) => ${JSON.stringify(result)}`);
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
      description: "Use the documented two-argument form to prepend one array to another.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Iterable Invocation",
      description: "Use data-last style with a Set to prepend a prefix to iterable command args.",
      run: exampleCurriedIterableInvocation,
    },
  ],
});

BunRuntime.runMain(program);
