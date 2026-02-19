/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: gen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Generator-based syntax for composing `Result` values sequentially.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * const result = Result.gen(function*() {
 *   const a = yield* Result.succeed(1)
 *   const b = yield* Result.succeed(2)
 *   return a + b
 * })
 *
 * console.log(result)
 * // Output: { _tag: "Success", success: 3, ... }
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
const exportName = "gen";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Generator-based syntax for composing `Result` values sequentially.";
const sourceExample =
  'import { Result } from "effect"\n\nconst result = Result.gen(function*() {\n  const a = yield* Result.succeed(1)\n  const b = yield* Result.succeed(2)\n  return a + b\n})\n\nconsole.log(result)\n// Output: { _tag: "Success", success: 3, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;
const summarizeResult = <A, E>(result: ResultModule.Result<A, E>): string =>
  ResultModule.match(result, {
    onSuccess: (success) => `Success(${formatUnknown(success)})`,
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
  });

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.gen as a callable generator-composition helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedComposition = Effect.gen(function* () {
  yield* Console.log("Compose two successful Results and return their sum.");

  const result = ResultModule.gen(function* () {
    const a = yield* ResultModule.succeed(1);
    const b = yield* ResultModule.succeed(2);
    return a + b;
  });

  yield* Console.log(`Result.gen(function* { succeed(1), succeed(2) }) -> ${summarizeResult(result)}`);
});

const exampleFailureShortCircuit = Effect.gen(function* () {
  yield* Console.log("A yielded failure short-circuits and skips later generator steps.");
  let reachedAfterFailure = false;

  const result = ResultModule.gen(function* () {
    yield* ResultModule.succeed("begin");
    yield* ResultModule.fail("boom");
    reachedAfterFailure = true;
    return "unreachable";
  });

  yield* Console.log(`Result.gen short-circuit -> ${summarizeResult(result)}`);
  yield* Console.log(`code after failure reached: ${reachedAfterFailure}`);
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
      title: "Source-Aligned Success Composition",
      description: "Use the documented generator pattern to compose two successes into one value.",
      run: exampleSourceAlignedComposition,
    },
    {
      title: "Failure Short-Circuit Semantics",
      description: "Show that yielding a failure returns that failure and skips later generator logic.",
      run: exampleFailureShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
