/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: liftNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Lifts a nullable-returning function into one that returns an array: `null`/`undefined` becomes `[]`, anything else becomes `[value]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const parseNumber = Array.liftNullishOr((s: string) => {
 *   const n = Number(s)
 *   return isNaN(n) ? null : n
 * })
 * console.log(parseNumber("123")) // [123]
 * console.log(parseNumber("abc")) // []
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
const exportName = "liftNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Lifts a nullable-returning function into one that returns an array: `null`/`undefined` becomes `[]`, anything else becomes `[value]`.";
const sourceExample =
  'import { Array } from "effect"\n\nconst parseNumber = Array.liftNullishOr((s: string) => {\n  const n = Number(s)\n  return isNaN(n) ? null : n\n})\nconsole.log(parseNumber("123")) // [123]\nconsole.log(parseNumber("abc")) // []';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect liftNullishOr before lifting domain functions.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const parseNumber = A.liftNullishOr((s: string) => {
    const n = Number(s);
    return Number.isNaN(n) ? null : n;
  });

  for (const input of ["123", "42.5", "abc"] as const) {
    yield* Console.log(`parseNumber(${JSON.stringify(input)}) => ${JSON.stringify(parseNumber(input))}`);
  }
});

const exampleNullishNormalizationWithMultipleArgs = Effect.gen(function* () {
  const getBadge = A.liftNullishOr((id: number, includeInactive: boolean): string | null | undefined => {
    if (id === 1) {
      return "ALPHA";
    }
    if (id === 2) {
      return null;
    }
    if (id === 3 && includeInactive) {
      return "LEGACY";
    }
    return undefined;
  });

  for (const [id, includeInactive] of [
    [1, false],
    [2, false],
    [3, false],
    [3, true],
  ] as const) {
    yield* Console.log(`getBadge(${id}, ${includeInactive}) => ${JSON.stringify(getBadge(id, includeInactive))}`);
  }
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
      title: "Source-Aligned Parsing Lift",
      description: "Lift a nullable parse function so invalid numeric text becomes an empty array.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Nullish Normalization Across Arguments",
      description: "Show that both null and undefined collapse to [] while non-null values become singletons.",
      run: exampleNullishNormalizationWithMultipleArgs,
    },
  ],
});

BunRuntime.runMain(program);
