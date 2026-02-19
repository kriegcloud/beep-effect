/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: transposeMapOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Maps an `Option` value with a `Result`-producing function, then transposes the structure from `Option<Result<B, E>>` to `Result<Option<B>, E>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * const parse = (s: string) =>
 *   isNaN(Number(s))
 *     ? Result.fail("not a number" as const)
 *     : Result.succeed(Number(s))
 *
 * console.log(Result.transposeMapOption(Option.some("42"), parse))
 * // Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }
 *
 * console.log(Result.transposeMapOption(Option.none(), parse))
 * // Output: { _tag: "Success", success: { _tag: "None" }, ... }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "transposeMapOption";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Maps an `Option` value with a `Result`-producing function, then transposes the structure from `Option<Result<B, E>>` to `Result<Option<B>, E>`.";
const sourceExample =
  'import { Option, Result } from "effect"\n\nconst parse = (s: string) =>\n  isNaN(Number(s))\n    ? Result.fail("not a number" as const)\n    : Result.succeed(Number(s))\n\nconsole.log(Result.transposeMapOption(Option.some("42"), parse))\n// Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }\n\nconsole.log(Result.transposeMapOption(Option.none(), parse))\n// Output: { _tag: "Success", success: { _tag: "None" }, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

const summarizeOption = (option: O.Option<unknown>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${formatUnknown(value)})`,
  })(option);

const summarizeResult = (result: ResultModule.Result<O.Option<unknown>, unknown>): string =>
  ResultModule.isSuccess(result)
    ? `Success(${summarizeOption(result.success)})`
    : `Failure(${formatUnknown(result.failure)})`;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect transposeMapOption as a callable Option-to-Result transformer.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedParsing = Effect.gen(function* () {
  yield* Console.log("Run the source-style parser over Some and None Option inputs.");

  let parseCalls = 0;
  const parse = (raw: string): ResultModule.Result<number, "not a number"> => {
    parseCalls += 1;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? ResultModule.fail("not a number" as const) : ResultModule.succeed(parsed);
  };

  const fromSome = ResultModule.transposeMapOption(O.some("42"), parse);
  const fromNone = ResultModule.transposeMapOption(O.none<string>(), parse);

  yield* Console.log(`Option.some("42") -> ${summarizeResult(fromSome)}`);
  yield* Console.log(`Option.none() -> ${summarizeResult(fromNone)}`);
  yield* Console.log(`parse callback calls: ${parseCalls} (Some triggers parse, None skips it)`);
});

const exampleFailurePropagation = Effect.gen(function* () {
  yield* Console.log("Show that parse failures become Result failures, while valid values succeed.");

  const parseInteger = (raw: string): ResultModule.Result<number, string> => {
    const parsed = Number(raw);
    return Number.isInteger(parsed) ? ResultModule.succeed(parsed) : ResultModule.fail(`invalid integer: ${raw}`);
  };

  const validInput = ResultModule.transposeMapOption(O.some("7"), parseInteger);
  const invalidInput = ResultModule.transposeMapOption(O.some("7.5"), parseInteger);

  yield* Console.log(`Option.some("7") -> ${summarizeResult(validInput)}`);
  yield* Console.log(`Option.some("7.5") -> ${summarizeResult(invalidInput)}`);
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
      title: "Source-Aligned Parsing",
      description: "Apply the documented parse example to Some/None and observe transposed output.",
      run: exampleSourceAlignedParsing,
    },
    {
      title: "Failure Propagation",
      description: "Demonstrate that parse errors surface as Result failures after transposition.",
      run: exampleFailurePropagation,
    },
  ],
});

BunRuntime.runMain(program);
