/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: getOrUndefined
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Extracts the success value, or returns `undefined` on failure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.getOrUndefined(Result.succeed(1)))
 * // Output: 1
 *
 * console.log(Result.getOrUndefined(Result.fail("err")))
 * // Output: undefined
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
const exportName = "getOrUndefined";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Extracts the success value, or returns `undefined` on failure.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.getOrUndefined(Result.succeed(1)))\n// Output: 1\n\nconsole.log(Result.getOrUndefined(Result.fail("err")))\n// Output: undefined';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.getOrUndefined as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedUnwrap = Effect.gen(function* () {
  yield* Console.log("Unwrap success and failure values to undefined-aware output.");
  const fromSuccess = ResultModule.getOrUndefined(ResultModule.succeed(1));
  const fromFailure = ResultModule.getOrUndefined(ResultModule.fail("err"));

  yield* Console.log(`succeed(1) -> ${formatUnknown(fromSuccess)}`);
  yield* Console.log(`fail("err") -> ${formatUnknown(fromFailure)}`);
  yield* Console.log(`failure is undefined -> ${fromFailure === undefined}`);
});

const exampleUndefinedInterop = Effect.gen(function* () {
  yield* Console.log("Use getOrUndefined outputs with undefined-aware filtering.");
  const optionalValues = [
    ResultModule.getOrUndefined(ResultModule.succeed("alpha")),
    ResultModule.getOrUndefined(ResultModule.fail({ code: 404, reason: "missing" })),
    ResultModule.getOrUndefined(ResultModule.succeed("beta")),
  ];
  const presentValues = optionalValues.filter((value): value is string => value !== undefined);
  const printableOptionalValues = optionalValues.map((value) => (value === undefined ? "undefined" : value));

  yield* Console.log(`optional values -> ${formatUnknown(printableOptionalValues)}`);
  yield* Console.log(`middle value is undefined -> ${optionalValues[1] === undefined}`);
  yield* Console.log(`present values -> ${formatUnknown(presentValues)}`);
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
      title: "Source-Aligned Undefined Unwrap",
      description: "Run the documented succeed/fail invocations and observe `undefined` on failure.",
      run: exampleSourceAlignedUnwrap,
    },
    {
      title: "Undefined Interop Workflow",
      description: "Map multiple Result values to optional outputs and filter defined successes.",
      run: exampleUndefinedInterop,
    },
  ],
});

BunRuntime.runMain(program);
