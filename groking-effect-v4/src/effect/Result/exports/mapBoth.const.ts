/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: mapBoth
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Transforms both the success and failure channels of a `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.succeed(1),
 *   Result.mapBoth({
 *     onSuccess: (n) => n + 1,
 *     onFailure: (e) => `Error: ${e}`
 *   })
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: 2, ... }
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
const exportName = "mapBoth";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Transforms both the success and failure channels of a `Result`.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.succeed(1),\n  Result.mapBoth({\n    onSuccess: (n) => n + 1,\n    onFailure: (e) => `Error: ${e}`\n  })\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: 2, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect mapBoth as a callable Result dual-channel transformer.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedDualChannelMapping = Effect.gen(function* () {
  yield* Console.log("Map both channels using the documented options object form.");

  const successInput: ResultModule.Result<number, string> = ResultModule.succeed(1);
  const failureInput: ResultModule.Result<number, string> = ResultModule.fail("not found");

  const onSuccess = (n: number) => n + 1;
  const onFailure = (error: string) => `Error: ${error}`;

  const mappedSuccess = successInput.pipe(ResultModule.mapBoth({ onSuccess, onFailure }));
  const mappedFailure = failureInput.pipe(ResultModule.mapBoth({ onSuccess, onFailure }));

  yield* Console.log(`succeed(1) -> ${summarizeResult(mappedSuccess)}`);
  yield* Console.log(`fail("not found") -> ${summarizeResult(mappedFailure)}`);
});

const exampleDataFirstBranchExecution = Effect.gen(function* () {
  yield* Console.log("Data-first invocation runs only the matching branch callback.");

  let successCalls = 0;
  let failureCalls = 0;

  const options = {
    onSuccess: (n: number) => {
      successCalls += 1;
      return n * 10;
    },
    onFailure: (error: string) => {
      failureCalls += 1;
      return `wrapped:${error}`;
    },
  };

  const successInput: ResultModule.Result<number, string> = ResultModule.succeed(2);
  const failureInput: ResultModule.Result<number, string> = ResultModule.fail("boom");

  const mappedSuccess = ResultModule.mapBoth(successInput, options);
  const countsAfterSuccess = `${successCalls}/${failureCalls}`;
  const mappedFailure = ResultModule.mapBoth(failureInput, options);
  const countsAfterFailure = `${successCalls}/${failureCalls}`;

  yield* Console.log(
    `mapBoth(Success(2), options) -> ${summarizeResult(mappedSuccess)} (calls s/f: ${countsAfterSuccess})`
  );
  yield* Console.log(
    `mapBoth(Failure("boom"), options) -> ${summarizeResult(mappedFailure)} (calls s/f: ${countsAfterFailure})`
  );
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
      title: "Source-Aligned Dual-Channel Mapping",
      description: "Apply documented `onSuccess` / `onFailure` handlers to Success and Failure inputs.",
      run: exampleSourceAlignedDualChannelMapping,
    },
    {
      title: "Data-First Branch Execution",
      description: "Show data-first invocation and confirm only the matching branch callback runs.",
      run: exampleDataFirstBranchExecution,
    },
  ],
});

BunRuntime.runMain(program);
