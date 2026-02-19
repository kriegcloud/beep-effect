/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: getOrThrowWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Extracts the success value or throws a custom error derived from the failure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(
 *   Result.getOrThrowWith(Result.succeed(1), () => new Error("fail"))
 * )
 * // Output: 1
 *
 * // This would throw: new Error("Unexpected: oops")
 * // Result.getOrThrowWith(
 * //   Result.fail("oops"),
 * //   (err) => new Error(`Unexpected: ${err}`)
 * // )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  attemptThunk,
  createPlaygroundProgram,
  formatUnknown,
  inspectNamedExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getOrThrowWith";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Extracts the success value or throws a custom error derived from the failure.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(\n  Result.getOrThrowWith(Result.succeed(1), () => new Error("fail"))\n)\n// Output: 1\n\n// This would throw: new Error("Unexpected: oops")\n// Result.getOrThrowWith(\n//   Result.fail("oops"),\n//   (err) => new Error(`Unexpected: ${err}`)\n// )';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.getOrThrowWith as a callable Result helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const formatThrownError = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return formatUnknown(error);
};

const exampleSourceAlignedCustomThrow = Effect.gen(function* () {
  yield* Console.log("Use getOrThrowWith(result, onFailure) for success and mapped failure.");

  const successValue = ResultModule.getOrThrowWith(ResultModule.succeed(1), () => new Error("fail"));
  const failureAttempt = yield* attemptThunk(() =>
    ResultModule.getOrThrowWith(ResultModule.fail("oops"), (err) => new Error(`Unexpected: ${err}`))
  );

  yield* Console.log(`succeed(1) -> ${formatUnknown(successValue)}`);
  if (failureAttempt._tag === "Left") {
    yield* Console.log(`fail("oops") threw ${formatThrownError(failureAttempt.error)}`);
  } else {
    yield* Console.log(`fail("oops") unexpectedly returned ${formatUnknown(failureAttempt.value)}`);
  }
});

const exampleCurriedMapper = Effect.gen(function* () {
  yield* Console.log("Use the curried form and confirm mapper runs only on failures.");

  let mapperCalls = 0;
  const unwrapOrTypeError = ResultModule.getOrThrowWith((err: { code: number; reason: string }) => {
    mapperCalls += 1;
    return new TypeError(`E${err.code}: ${err.reason}`);
  });

  const successValue = unwrapOrTypeError(ResultModule.succeed("ok"));
  const successCalls = mapperCalls;
  const failureAttempt = yield* attemptThunk(() =>
    unwrapOrTypeError(ResultModule.fail({ code: 422, reason: "invalid payload" }))
  );

  yield* Console.log(`curried succeed("ok") -> ${formatUnknown(successValue)} (mapper calls: ${successCalls})`);
  if (failureAttempt._tag === "Left") {
    yield* Console.log(
      `curried fail({ code: 422, ... }) threw ${formatThrownError(failureAttempt.error)} (mapper calls: ${mapperCalls})`
    );
  } else {
    yield* Console.log(
      `curried fail({ code: 422, ... }) unexpectedly returned ${formatUnknown(failureAttempt.value)} (mapper calls: ${mapperCalls})`
    );
  }
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
      title: "Source-Aligned Custom Throw",
      description: "Run documented success behavior and show mapped failure throws.",
      run: exampleSourceAlignedCustomThrow,
    },
    {
      title: "Curried Mapper Semantics",
      description: "Use the curried overload and verify mapper execution on failure only.",
      run: exampleCurriedMapper,
    },
  ],
});

BunRuntime.runMain(program);
