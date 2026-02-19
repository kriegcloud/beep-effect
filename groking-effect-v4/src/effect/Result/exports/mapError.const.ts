/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: mapError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Transforms the failure channel of a `Result`, leaving the success channel unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.fail("not found"),
 *   Result.mapError((e) => `Error: ${e}`)
 * )
 * console.log(result)
 * // Output: { _tag: "Failure", failure: "Error: not found", ... }
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
const exportName = "mapError";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Transforms the failure channel of a `Result`, leaving the success channel unchanged.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.fail("not found"),\n  Result.mapError((e) => `Error: ${e}`)\n)\nconsole.log(result)\n// Output: { _tag: "Failure", failure: "Error: not found", ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect mapError as a callable Result failure-channel transformer.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedErrorMapping = Effect.gen(function* () {
  yield* Console.log("mapError transforms Failure values while preserving Success.");
  const fromFailure = ResultModule.fail("not found").pipe(ResultModule.mapError((e) => `Error: ${e}`));
  const fromSuccess: ResultModule.Result<number, string> = ResultModule.succeed(3);
  const unchangedSuccess = fromSuccess.pipe(ResultModule.mapError((e) => `Error: ${e}`));

  yield* Console.log(`fail("not found") -> ${summarizeResult(fromFailure)}`);
  yield* Console.log(`succeed(3) -> ${summarizeResult(unchangedSuccess)}`);
});

const exampleMapperExecution = Effect.gen(function* () {
  yield* Console.log("Mapper executes only for Failure inputs.");
  let mapperCalls = 0;
  const mapper = (error: string) => {
    mapperCalls += 1;
    return { type: "MappedError", message: error.toUpperCase() };
  };

  const dataFirstFailure: ResultModule.Result<number, string> = ResultModule.fail("boom");
  const mappedFailure = ResultModule.mapError(dataFirstFailure, mapper);
  const callsAfterFailure = mapperCalls;

  const dataFirstSuccess: ResultModule.Result<number, string> = ResultModule.succeed(1);
  const mappedSuccess = ResultModule.mapError(dataFirstSuccess, mapper);
  const callsAfterSuccess = mapperCalls;

  yield* Console.log(
    `mapError(fail("boom"), mapper) -> ${summarizeResult(mappedFailure)} (calls: ${callsAfterFailure})`
  );
  yield* Console.log(`mapError(succeed(1), mapper) -> ${summarizeResult(mappedSuccess)} (calls: ${callsAfterSuccess})`);
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
      title: "Source-Aligned Error Mapping",
      description: "Reproduce the documented failure mapping behavior and confirm Success is unchanged.",
      run: exampleSourceAlignedErrorMapping,
    },
    {
      title: "Mapper Execution Behavior",
      description: "Use data-first invocation and show the mapper is skipped for Success inputs.",
      run: exampleMapperExecution,
    },
  ],
});

BunRuntime.runMain(program);
