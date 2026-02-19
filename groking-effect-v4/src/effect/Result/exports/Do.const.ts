/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: Do
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Starting point for the "do notation" simulation with `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.Do,
 *   Result.bind("x", () => Result.succeed(2)),
 *   Result.bind("y", () => Result.succeed(3)),
 *   Result.let("sum", ({ x, y }) => x + y)
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: { x: 2, y: 3, sum: 5 }, ... }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Do";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = 'Starting point for the "do notation" simulation with `Result`.';
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.Do,\n  Result.bind("x", () => Result.succeed(2)),\n  Result.bind("y", () => Result.succeed(3)),\n  Result.let("sum", ({ x, y }) => x + y)\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: { x: 2, y: 3, sum: 5 }, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.Do as the seed value for do-notation chains.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${JSON.stringify(failure)})`,
    onSuccess: (value) => `Success(${JSON.stringify(value)})`,
  })(result);

const exampleDoNotationSuccess = Effect.gen(function* () {
  yield* Console.log("Compose a record from Result.Do using bind and let.");
  const result = ResultModule.Do.pipe(
    ResultModule.bind("x", () => ResultModule.succeed(2)),
    ResultModule.bind("y", () => ResultModule.succeed(3)),
    ResultModule.let("sum", ({ x, y }) => x + y)
  );

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`isSuccess: ${ResultModule.isSuccess(result)}`);
});

const exampleDoNotationFailure = Effect.gen(function* () {
  yield* Console.log("Show short-circuiting when one binding fails.");
  const result = ResultModule.Do.pipe(
    ResultModule.bind("x", () => ResultModule.succeed(2)),
    ResultModule.bind("y", () => ResultModule.fail("missing-y")),
    ResultModule.let("sum", ({ x, y }) => x + y)
  );

  yield* Console.log(`result: ${summarizeResult(result)}`);
  const fallback = ResultModule.getOrElse(() => ({ x: -1, y: -1, sum: -1 }))(result);
  yield* Console.log(`fallback: ${JSON.stringify(fallback)}`);
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
      title: "Do Notation Happy Path",
      description: "Start from Result.Do, bind fields, and derive a computed value with let.",
      run: exampleDoNotationSuccess,
    },
    {
      title: "Do Notation Failure Path",
      description: "Demonstrate that a failing bind stops the chain and uses fallback recovery.",
      run: exampleDoNotationFailure,
    },
  ],
});

BunRuntime.runMain(program);
