/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: bindTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.346Z
 *
 * Overview:
 * Names the elements of an array by wrapping each in an object with the given key, starting a do-notation scope.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   [1, 2, 3],
 *   Array.bindTo("x")
 * )
 * console.log(result) // [{ x: 1 }, { x: 2 }, { x: 3 }]
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
const exportName = "bindTo";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Names the elements of an array by wrapping each in an object with the given key, starting a do-notation scope.";
const sourceExample =
  'import { Array, pipe } from "effect"\n\nconst result = pipe(\n  [1, 2, 3],\n  Array.bindTo("x")\n)\nconsole.log(result) // [{ x: 1 }, { x: 2 }, { x: 3 }]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect bindTo as a runtime value before applying it.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const result = A.bindTo([1, 2, 3], "x");
  yield* Console.log(`bindTo([1,2,3], "x"): ${JSON.stringify(result)}`);
});

const exampleDoNotationSeed = Effect.gen(function* () {
  const scoped = A.bindTo(["beep", "boop"], "name");
  const withLength = A.bind(scoped, "length", ({ name }) => [name.length]);
  const withLabel = A.let(withLength, "label", ({ name, length }) => `${name}:${length}`);

  yield* Console.log(`Seed + bind + let: ${JSON.stringify(withLabel)}`);
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
      title: "Source-Aligned Naming",
      description: "Apply bindTo to wrap each element with a single key as shown in the docs.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Seed Scope for Do-Notation",
      description: "Start from bindTo and extend records with bind/let in a deterministic pipeline.",
      run: exampleDoNotationSeed,
    },
  ],
});

BunRuntime.runMain(program);
