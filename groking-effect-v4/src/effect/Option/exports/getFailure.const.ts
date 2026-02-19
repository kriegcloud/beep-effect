/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: getFailure
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Converts a `Result` into an `Option`, keeping only the error value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * console.log(Option.getFailure(Result.succeed("ok")))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.getFailure(Result.fail("err")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'err' }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Result from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getFailure";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts a `Result` into an `Option`, keeping only the error value.";
const sourceExample =
  "import { Option, Result } from \"effect\"\n\nconsole.log(Option.getFailure(Result.succeed(\"ok\")))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.getFailure(Result.fail(\"err\")))\n// Output: { _id: 'Option', _tag: 'Some', value: 'err' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSuccessResultDropsErrorChannel = Effect.gen(function* () {
  const successResult = Result.succeed("ok");
  const failureOnly = O.getFailure(successResult);

  yield* Console.log(`Result.succeed("ok") -> ${O.isNone(failureOnly) ? "None (no failure to keep)" : "Some"}`);
});

const exampleFailureResultKeepsErrorValue = Effect.gen(function* () {
  const failedResult = Result.fail("err");
  const failureOnly = O.getFailure(failedResult);
  const rendered = O.match(failureOnly, {
    onNone: () => "None",
    onSome: (failure) => `Some(${String(failure)})`,
  });

  yield* Console.log(`Result.fail("err") -> ${rendered}`);
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
      title: "Success Result Becomes None",
      description: "A successful Result has no error value, so getFailure returns None.",
      run: exampleSuccessResultDropsErrorChannel,
    },
    {
      title: "Failure Result Becomes Some",
      description: "A failed Result keeps its error in Some(error).",
      run: exampleFailureResultKeepsErrorValue,
    },
  ],
});

BunRuntime.runMain(program);
