/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: fromOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Converts an `Option<A>` into a `Result<A, E>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * const some = Result.fromOption(Option.some(1), () => "missing")
 * console.log(some)
 * // Output: { _tag: "Success", success: 1, ... }
 *
 * const none = Result.fromOption(Option.none(), () => "missing")
 * console.log(none)
 * // Output: { _tag: "Failure", failure: "missing", ... }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromOption";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Converts an `Option<A>` into a `Result<A, E>`.";
const sourceExample =
  'import { Option, Result } from "effect"\n\nconst some = Result.fromOption(Option.some(1), () => "missing")\nconsole.log(some)\n// Output: { _tag: "Success", success: 1, ... }\n\nconst none = Result.fromOption(Option.none(), () => "missing")\nconsole.log(none)\n// Output: { _tag: "Failure", failure: "missing", ... }';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (success) => `Success(${formatUnknown(success)})`,
  })(result);

const exampleSourceAlignedConversion = Effect.gen(function* () {
  yield* Console.log("Convert Some and None using fromOption(option, onNone).");
  const someResult = ResultModule.fromOption(O.some(1), () => "missing");
  const noneResult = ResultModule.fromOption(O.none<number>(), () => "missing");

  yield* Console.log(`some -> ${summarizeResult(someResult)}`);
  yield* Console.log(`none -> ${summarizeResult(noneResult)}`);
});

const exampleCurriedFormLaziness = Effect.gen(function* () {
  yield* Console.log("Use the curried form and show onNone runs only for None.");
  let onNoneCalls = 0;

  const fromOptionWithCounter = ResultModule.fromOption(() => {
    onNoneCalls += 1;
    return `missing-${onNoneCalls}`;
  });

  const fromSome = fromOptionWithCounter(O.some(42));
  const callsAfterSome = onNoneCalls;
  const fromNone = fromOptionWithCounter(O.none<number>());
  const callsAfterNone = onNoneCalls;

  yield* Console.log(`curried some -> ${summarizeResult(fromSome)} (onNone calls: ${callsAfterSome})`);
  yield* Console.log(`curried none -> ${summarizeResult(fromNone)} (onNone calls: ${callsAfterNone})`);
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
      title: "Source-Aligned Option Conversion",
      description: "Use Option.some and Option.none with fromOption(option, onNone).",
      run: exampleSourceAlignedConversion,
    },
    {
      title: "Curried Form And Lazy onNone",
      description: "Use fromOption(onNone)(option) and confirm onNone executes only for None.",
      run: exampleCurriedFormLaziness,
    },
  ],
});

BunRuntime.runMain(program);
