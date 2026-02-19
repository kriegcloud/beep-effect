/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: liftResult
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.361Z
 *
 * Overview:
 * Lifts a `Result`-returning function into one that returns an array: failures produce `[]`, successes produce `[value]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Result } from "effect"
 *
 * const parseNumber = (s: string): Result.Result<number, Error> =>
 *   isNaN(Number(s))
 *     ? Result.fail(new Error("Not a number"))
 *     : Result.succeed(Number(s))
 *
 * const liftedParseNumber = Array.liftResult(parseNumber)
 * console.log(liftedParseNumber("42")) // [42]
 * console.log(liftedParseNumber("not a number")) // []
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
import * as Result from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "liftResult";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Lifts a `Result`-returning function into one that returns an array: failures produce `[]`, successes produce `[value]`.";
const sourceExample =
  'import { Array, Result } from "effect"\n\nconst parseNumber = (s: string): Result.Result<number, Error> =>\n  isNaN(Number(s))\n    ? Result.fail(new Error("Not a number"))\n    : Result.succeed(Number(s))\n\nconst liftedParseNumber = Array.liftResult(parseNumber)\nconsole.log(liftedParseNumber("42")) // [42]\nconsole.log(liftedParseNumber("not a number")) // []';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedParse = Effect.gen(function* () {
  const parseNumber = (s: string): Result.Result<number, Error> => {
    const n = Number(s);
    return Number.isNaN(n) ? Result.fail(new Error("Not a number")) : Result.succeed(n);
  };
  const liftedParseNumber = A.liftResult(parseNumber);

  yield* Console.log(`liftedParseNumber("42") => ${JSON.stringify(liftedParseNumber("42"))}`);
  yield* Console.log(`liftedParseNumber("not a number") => ${JSON.stringify(liftedParseNumber("not a number"))}`);
});

const exampleMultiArgumentFunction = Effect.gen(function* () {
  const divide = (numerator: number, denominator: number): Result.Result<number, string> =>
    denominator === 0 ? Result.fail("division by zero") : Result.succeed(numerator / denominator);
  const liftedDivide = A.liftResult(divide);

  yield* Console.log(`liftedDivide(10, 2) => ${JSON.stringify(liftedDivide(10, 2))}`);
  yield* Console.log(`liftedDivide(10, 0) => ${JSON.stringify(liftedDivide(10, 0))}`);
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
      title: "Source-Aligned Parsing Behavior",
      description: "Lift a Result parser and show success/failure mapping to one-or-zero array values.",
      run: exampleSourceAlignedParse,
    },
    {
      title: "Multi-Argument Failure Mode",
      description: "Demonstrate that lifted functions preserve arguments and collapse failures to empty arrays.",
      run: exampleMultiArgumentFunction,
    },
  ],
});

BunRuntime.runMain(program);
