/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: intersectionWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.360Z
 *
 * Overview:
 * Computes the intersection of two arrays using a custom equivalence. Order is determined by the first array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
 * const array2 = [{ id: 3 }, { id: 4 }, { id: 1 }]
 * const isEquivalent = (a: { id: number }, b: { id: number }) => a.id === b.id
 * console.log(Array.intersectionWith(isEquivalent)(array2)(array1)) // [{ id: 1 }, { id: 3 }]
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
const exportName = "intersectionWith";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Computes the intersection of two arrays using a custom equivalence. Order is determined by the first array.";
const sourceExample =
  'import { Array } from "effect"\n\nconst array1 = [{ id: 1 }, { id: 2 }, { id: 3 }]\nconst array2 = [{ id: 3 }, { id: 4 }, { id: 1 }]\nconst isEquivalent = (a: { id: number }, b: { id: number }) => a.id === b.id\nconsole.log(Array.intersectionWith(isEquivalent)(array2)(array1)) // [{ id: 1 }, { id: 3 }]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export and confirm it builds an intersection function from custom equivalence.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedIntersection = Effect.gen(function* () {
  type Item = { readonly id: number; readonly label: string };
  const array1: ReadonlyArray<Item> = [
    { id: 1, label: "first" },
    { id: 2, label: "second" },
    { id: 3, label: "third" },
  ];
  const array2: ReadonlyArray<Item> = [
    { id: 3, label: "THIRD" },
    { id: 4, label: "fourth" },
    { id: 1, label: "FIRST" },
  ];
  const byId = A.intersectionWith<Item>((left, right) => left.id === right.id);
  const sourceStyle = byId(array2)(array1);
  const twoArgument = byId(array1, array2);

  yield* Console.log(`intersectionWith(byId)(array2)(array1) -> [${sourceStyle.map((item) => item.id).join(", ")}]`);
  yield* Console.log(`intersectionWith(byId)(array1, array2) -> [${twoArgument.map((item) => item.id).join(", ")}]`);
});

const exampleCaseInsensitiveIntersection = Effect.gen(function* () {
  const left = ["BETA", "Alpha", "beta", "Gamma"];
  const right = ["beta", "delta", "ALPHA"];
  const caseInsensitive = A.intersectionWith<string>((a, b) => a.toLowerCase() === b.toLowerCase());
  const result = caseInsensitive(left, right);

  yield* Console.log(`caseInsensitive(left, right) -> [${result.join(", ")}]`);
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
      title: "Source-Aligned Intersection",
      description: "Run the documented object-by-id comparison and show curried and two-argument forms.",
      run: exampleSourceAlignedIntersection,
    },
    {
      title: "Case-Insensitive Intersection",
      description: "Intersect strings with case-insensitive equivalence to show order follows the first array.",
      run: exampleCaseInsensitiveIntersection,
    },
  ],
});

BunRuntime.runMain(program);
