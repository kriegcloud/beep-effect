/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: try
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
const exportName = "try";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Wraps a synchronous computation that may throw into a `Result`.";
const sourceExample =
  'import { Result } from "effect"\n\nconst ok = Result.try(() => JSON.parse(\'{"name": "Alice"}\'))\nconsole.log(ok)\n// Output: { _tag: "Success", success: { name: "Alice" }, ... }\n\nconst err = Result.try({\n  try: () => JSON.parse("not json"),\n  catch: (e) => `Parse failed: ${e}`\n})\nconsole.log(Result.isFailure(err))\n// Output: true';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect try as a callable Result constructor.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) =>
      `Failure(${failure instanceof Error ? `Error(${failure.message})` : formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedJsonParsing = Effect.gen(function* () {
  yield* Console.log("Wrap JSON.parse with Result.try for success and mapped failure cases.");
  const ok = ResultModule.try(() => JSON.parse('{"name": "Alice"}'));
  const err = ResultModule.try({
    try: () => JSON.parse("not json"),
    catch: () => "Parse failed",
  });

  yield* Console.log(`valid JSON -> ${summarizeResult(ok)}`);
  yield* Console.log(`invalid JSON -> ${summarizeResult(err)} (isFailure: ${ResultModule.isFailure(err)})`);
});

const exampleCatchMapperExecution = Effect.gen(function* () {
  yield* Console.log("The catch mapper is evaluated only when the wrapped computation throws.");
  let catchCalls = 0;
  const mapError = (error: unknown) => {
    catchCalls += 1;
    return error instanceof Error ? `mapped:${error.message}` : `mapped:${String(error)}`;
  };

  const fromSuccess = ResultModule.try({
    try: () => 42,
    catch: mapError,
  });
  const callsAfterSuccess = catchCalls;

  const fromFailure = ResultModule.try({
    try: () => {
      throw new Error("boom");
    },
    catch: mapError,
  });
  const callsAfterFailure = catchCalls;

  yield* Console.log(`try({ try: () => 42 }) -> ${summarizeResult(fromSuccess)} (catch calls: ${callsAfterSuccess})`);
  yield* Console.log(
    `try({ try: throw Error }) -> ${summarizeResult(fromFailure)} (catch calls: ${callsAfterFailure})`
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
      title: "Source-Aligned JSON Parsing",
      description: "Use try(() => ...) and try({ try, catch }) to model parse success/failure.",
      run: exampleSourceAlignedJsonParsing,
    },
    {
      title: "Catch Mapper Execution",
      description: "Show that the catch mapper is called only for thrown exceptions.",
      run: exampleCatchMapperExecution,
    },
  ],
});

BunRuntime.runMain(program);
