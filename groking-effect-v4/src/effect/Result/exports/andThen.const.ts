/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: andThen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * A flexible variant of {@link flatMap} that accepts multiple input shapes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * // With a function returning a Result
 * const a = pipe(
 *   Result.succeed(1),
 *   Result.andThen((n) => Result.succeed(n + 1))
 * )
 *
 * // With a plain mapping function
 * const b = pipe(
 *   Result.succeed(1),
 *   Result.andThen((n) => n + 1)
 * )
 *
 * // With a constant value
 * const c = pipe(Result.succeed(1), Result.andThen("done"))
 *
 * console.log(a, b, c)
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
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "andThen";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "A flexible variant of {@link flatMap} that accepts multiple input shapes.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\n// With a function returning a Result\nconst a = pipe(\n  Result.succeed(1),\n  Result.andThen((n) => Result.succeed(n + 1))\n)\n\n// With a plain mapping function\nconst b = pipe(\n  Result.succeed(1),\n  Result.andThen((n) => n + 1)\n)\n\n// With a constant value\nconst c = pipe(Result.succeed(1), Result.andThen("done"))\n\nconsole.log(a, b, c)';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect andThen as a callable sequencing helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSupportedInputShapes = Effect.gen(function* () {
  yield* Console.log("Run andThen with the documented argument shapes.");
  const base = ResultModule.succeed(1);
  const fromResultFunction = base.pipe(ResultModule.andThen((n) => ResultModule.succeed(n + 1)));
  const fromPlainFunction = base.pipe(ResultModule.andThen((n) => n + 1));
  const fromResultValue = base.pipe(ResultModule.andThen(ResultModule.succeed("wrapped")));
  const fromPlainValue = base.pipe(ResultModule.andThen("done"));

  yield* Console.log(`fn -> Result: ${summarizeResult(fromResultFunction)}`);
  yield* Console.log(`fn -> value: ${summarizeResult(fromPlainFunction)}`);
  yield* Console.log(`Result value: ${summarizeResult(fromResultValue)}`);
  yield* Console.log(`plain value: ${summarizeResult(fromPlainValue)}`);
});

const exampleFailureShortCircuit = Effect.gen(function* () {
  yield* Console.log("Failure input short-circuits and skips mapper execution.");
  let mapperInvoked = false;

  const output = ResultModule.fail("input-failure").pipe(
    ResultModule.andThen((_: never) => {
      mapperInvoked = true;
      return ResultModule.succeed("unreachable");
    })
  );

  yield* Console.log(`output: ${summarizeResult(output)}`);
  yield* Console.log(`mapperInvoked: ${mapperInvoked}`);
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
      title: "Supported Input Shapes",
      description: "Apply andThen with function/result/value inputs and compare outcomes.",
      run: exampleSupportedInputShapes,
    },
    {
      title: "Failure Short-Circuit",
      description: "Show that failing input preserves failure and does not run mapper logic.",
      run: exampleFailureShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
