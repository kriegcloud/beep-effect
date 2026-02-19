/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: succeed
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Creates a `Result` holding a `Success` value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * const result = Result.succeed(42)
 *
 * console.log(Result.isSuccess(result))
 * // Output: true
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
const exportName = "succeed";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Creates a `Result` holding a `Success` value.";
const sourceExample =
  'import { Result } from "effect"\n\nconst result = Result.succeed(42)\n\nconsole.log(Result.isSuccess(result))\n// Output: true';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect succeed as a runtime constructor for Success results.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedSuccess = Effect.gen(function* () {
  yield* Console.log("Create a success result with the JSDoc input and verify predicates.");
  const result = ResultModule.succeed(42);

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`isSuccess: ${ResultModule.isSuccess(result)}`);
  yield* Console.log(`isFailure: ${ResultModule.isFailure(result)}`);
  if (ResultModule.isSuccess(result)) {
    yield* Console.log(`success payload: ${result.success}`);
  }
});

const exampleSuccessTransformFlow = Effect.gen(function* () {
  yield* Console.log("Success values run through andThen/map and keep the transformed output.");
  let andThenInvoked = false;

  const transformed = ResultModule.succeed(10).pipe(
    ResultModule.andThen((value) => {
      andThenInvoked = true;
      return ResultModule.succeed(value + 5);
    }),
    ResultModule.map((value) => value * 2)
  );

  const finalValue = ResultModule.getOrElse(() => -1)(transformed);
  yield* Console.log(`transformed: ${summarizeResult(transformed)}`);
  yield* Console.log(`andThenInvoked: ${andThenInvoked}`);
  yield* Console.log(`finalValue: ${finalValue}`);
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
      title: "Create a Success Result",
      description: "Use succeed with the source-aligned value and verify Success predicates.",
      run: exampleSourceAlignedSuccess,
    },
    {
      title: "Success Transformation Flow",
      description: "Show that andThen/map execute for Success and produce the transformed value.",
      run: exampleSuccessTransformFlow,
    },
  ],
});

BunRuntime.runMain(program);
