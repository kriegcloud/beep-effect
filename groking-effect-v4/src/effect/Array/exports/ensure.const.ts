/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: ensure
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.348Z
 *
 * Overview:
 * Normalizes a value that is either a single element or an array into an array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.ensure("a")) // ["a"]
 * console.log(Array.ensure(["a", "b", "c"])) // ["a", "b", "c"]
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
const exportName = "ensure";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Normalizes a value that is either a single element or an array into an array.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.ensure("a")) // ["a"]\nconsole.log(Array.ensure(["a", "b", "c"])) // ["a", "b", "c"]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedNormalization = Effect.gen(function* () {
  const normalizedSingle = A.ensure("a");
  const normalizedArray = A.ensure(["a", "b", "c"]);

  yield* Console.log(`ensure("a") => ${JSON.stringify(normalizedSingle)}`);
  yield* Console.log(`ensure(["a", "b", "c"]) => ${JSON.stringify(normalizedArray)}`);
});

const exampleArrayPassThroughReference = Effect.gen(function* () {
  const input = ["left", "right"];
  const ensured = A.ensure(input);

  ensured.push("center");

  yield* Console.log(`ensure(input) returns same reference -> ${ensured === input}`);
  yield* Console.log(`after ensured.push("center"), input => ${JSON.stringify(input)}`);
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
      title: "Source-Aligned Normalization",
      description: "Normalize a single value and preserve an existing array as shown in the docs.",
      run: exampleSourceAlignedNormalization,
    },
    {
      title: "Array Pass-Through Reference",
      description: "Show that array inputs are returned by reference rather than copied.",
      run: exampleArrayPassThroughReference,
    },
  ],
});

BunRuntime.runMain(program);
