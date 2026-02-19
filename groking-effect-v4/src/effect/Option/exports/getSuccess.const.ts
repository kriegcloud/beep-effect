/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: getSuccess
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Converts a `Result` into an `Option`, keeping only the success value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * console.log(Option.getSuccess(Result.succeed("ok")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'ok' }
 *
 * console.log(Option.getSuccess(Result.fail("err")))
 * // Output: { _id: 'Option', _tag: 'None' }
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
const exportName = "getSuccess";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts a `Result` into an `Option`, keeping only the success value.";
const sourceExample =
  "import { Option, Result } from \"effect\"\n\nconsole.log(Option.getSuccess(Result.succeed(\"ok\")))\n// Output: { _id: 'Option', _tag: 'Some', value: 'ok' }\n\nconsole.log(Option.getSuccess(Result.fail(\"err\")))\n// Output: { _id: 'Option', _tag: 'None' }";

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSuccessResultKeepsSuccessValue = Effect.gen(function* () {
  const successResult = Result.succeed("ok");
  const successOnly = O.getSuccess(successResult);
  const rendered = O.match(successOnly, {
    onNone: () => "None",
    onSome: (success) => `Some(${String(success)})`,
  });

  yield* Console.log(`Result.succeed("ok") -> ${rendered}`);
});

const exampleFailureResultDropsSuccessValue = Effect.gen(function* () {
  const failedResult = Result.fail("err");
  const successOnly = O.getSuccess(failedResult);

  yield* Console.log(`Result.fail("err") -> ${O.isNone(successOnly) ? "None" : "Some"}`);
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
      title: "Success Result Becomes Some",
      description: "A successful Result keeps its value as Some(success).",
      run: exampleSuccessResultKeepsSuccessValue,
    },
    {
      title: "Failure Result Becomes None",
      description: "A failed Result has no success value, so getSuccess returns None.",
      run: exampleFailureResultDropsSuccessValue,
    },
  ],
});

BunRuntime.runMain(program);
