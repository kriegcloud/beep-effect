/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Transforms the success channel of a `Result`, leaving the failure channel unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.succeed(3),
 *   Result.map((n) => n * 2)
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: 6, ... }
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Transforms the success channel of a `Result`, leaving the failure channel unchanged.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.succeed(3),\n  Result.map((n) => n * 2)\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: 6, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect map as a callable Result success-channel transformer.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedSuccessMapping = Effect.gen(function* () {
  yield* Console.log("Map transforms Success values while preserving Failure.");
  const fromSuccess = ResultModule.succeed(3).pipe(ResultModule.map((n) => n * 2));
  const fromFailure = ResultModule.fail("not found").pipe(ResultModule.map((n: number) => n * 2));

  yield* Console.log(`succeed(3) -> ${summarizeResult(fromSuccess)}`);
  yield* Console.log(`fail("not found") -> ${summarizeResult(fromFailure)}`);
});

const exampleMapperExecution = Effect.gen(function* () {
  yield* Console.log("Mapper executes only for Success inputs.");
  let mapperCalls = 0;
  const mapper = (n: number) => {
    mapperCalls += 1;
    return n + 10;
  };

  const dataFirstSuccess = ResultModule.map(ResultModule.succeed(1), mapper);
  const callsAfterSuccess = mapperCalls;
  const dataFirstFailure = ResultModule.map(ResultModule.fail("boom"), mapper);
  const callsAfterFailure = mapperCalls;

  yield* Console.log(`map(succeed(1), mapper) -> ${summarizeResult(dataFirstSuccess)} (calls: ${callsAfterSuccess})`);
  yield* Console.log(`map(fail("boom"), mapper) -> ${summarizeResult(dataFirstFailure)} (calls: ${callsAfterFailure})`);
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
      title: "Source-Aligned Success Mapping",
      description: "Reproduce the documented mapping behavior for Success and Failure inputs.",
      run: exampleSourceAlignedSuccessMapping,
    },
    {
      title: "Mapper Execution Behavior",
      description: "Show data-first invocation and confirm the mapper is skipped for Failure.",
      run: exampleMapperExecution,
    },
  ],
});

BunRuntime.runMain(program);
