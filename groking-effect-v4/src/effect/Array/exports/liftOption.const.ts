/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: liftOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Lifts an `Option`-returning function into one that returns an array: `Some(a)` becomes `[a]`, `None` becomes `[]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Option } from "effect"
 *
 * const parseNumber = Array.liftOption((s: string) => {
 *   const n = Number(s)
 *   return isNaN(n) ? Option.none() : Option.some(n)
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
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "liftOption";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Lifts an `Option`-returning function into one that returns an array: `Some(a)` becomes `[a]`, `None` becomes `[]`.";
const sourceExample =
  'import { Array, Option } from "effect"\n\nconst parseNumber = Array.liftOption((s: string) => {\n  const n = Number(s)\n  return isNaN(n) ? Option.none() : Option.some(n)\n})\nconsole.log(parseNumber("123")) // [123]\nconsole.log(parseNumber("abc")) // []';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the runtime shape of Array.liftOption.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedParsing = Effect.gen(function* () {
  const parseNumber = A.liftOption((s: string) => {
    const n = Number(s);
    return Number.isNaN(n) ? O.none() : O.some(n);
  });

  yield* Console.log(`parseNumber("123") => ${JSON.stringify(parseNumber("123"))}`);
  yield* Console.log(`parseNumber("abc") => ${JSON.stringify(parseNumber("abc"))}`);
});

const exampleMultiArgForwarding = Effect.gen(function* () {
  const parsePoint = A.liftOption((xText: string, yText: string) => {
    const x = Number(xText);
    const y = Number(yText);
    return Number.isNaN(x) || Number.isNaN(y) ? O.none() : O.some({ x, y });
  });

  yield* Console.log(`parsePoint("10", "25") => ${JSON.stringify(parsePoint("10", "25"))}`);
  yield* Console.log(`parsePoint("10", "north") => ${JSON.stringify(parsePoint("10", "north"))}`);
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
      title: "Source-Aligned Number Parsing",
      description: "Lift an Option-returning parse function and observe Some -> [value], None -> [].",
      run: exampleSourceAlignedParsing,
    },
    {
      title: "Forwarding Multiple Arguments",
      description: "Show that liftOption preserves argument lists while still collapsing Option to array.",
      run: exampleMultiArgForwarding,
    },
  ],
});

BunRuntime.runMain(program);
