/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: flatMapNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.349Z
 *
 * Overview:
 * Maps each element with a nullable-returning function, keeping only non-null / non-undefined results.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.flatMapNullishOr([1, 2, 3], (n) => (n % 2 === 0 ? null : n)))
 * // [1, 3]
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
const exportName = "flatMapNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Maps each element with a nullable-returning function, keeping only non-null / non-undefined results.";
const sourceExample =
  'import { Array } from "effect"\n\nconsole.log(Array.flatMapNullishOr([1, 2, 3], (n) => (n % 2 === 0 ? null : n)))\n// [1, 3]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const result = A.flatMapNullishOr([1, 2, 3], (n) => (n % 2 === 0 ? null : n));

  yield* Console.log(`A.flatMapNullishOr([1, 2, 3], n => n % 2 === 0 ? null : n) => ${JSON.stringify(result)}`);
});

const exampleMapLookupDataFirstAndDataLast = Effect.gen(function* () {
  const inventory = new Map<string, number>([
    ["A-100", 12],
    ["B-200", 24],
    ["C-300", 36],
  ]);
  const requested = ["A-100", "MISSING", "C-300", "UNKNOWN"];

  const dataFirst = A.flatMapNullishOr(requested, (sku) => inventory.get(sku));
  const collectFound = A.flatMapNullishOr((sku: string) => inventory.get(sku));
  const dataLast = collectFound(requested);

  yield* Console.log(`data-first map.get lookup => ${JSON.stringify(dataFirst)}`);
  yield* Console.log(`data-last map.get lookup => ${JSON.stringify(dataLast)}`);
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
      description: "Keep odd values while dropping mapper results that are `null`.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Map Lookup With Both Call Styles",
      description: "Use `Map.get` to drop missing keys (`undefined`) in data-first and data-last forms.",
      run: exampleMapLookupDataFirstAndDataLast,
    },
  ],
});

BunRuntime.runMain(program);
