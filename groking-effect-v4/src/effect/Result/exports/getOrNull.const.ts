/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: getOrNull
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Extracts the success value, or returns `null` on failure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.getOrNull(Result.succeed(1)))
 * // Output: 1
 *
 * console.log(Result.getOrNull(Result.fail("err")))
 * // Output: null
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
const exportName = "getOrNull";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Extracts the success value, or returns `null` on failure.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.getOrNull(Result.succeed(1)))\n// Output: 1\n\nconsole.log(Result.getOrNull(Result.fail("err")))\n// Output: null';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.getOrNull as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedUnwrap = Effect.gen(function* () {
  yield* Console.log("Unwrap success and failure values to nullable output.");
  const fromSuccess = ResultModule.getOrNull(ResultModule.succeed(1));
  const fromFailure = ResultModule.getOrNull(ResultModule.fail("err"));

  yield* Console.log(`succeed(1) -> ${formatUnknown(fromSuccess)}`);
  yield* Console.log(`fail("err") -> ${formatUnknown(fromFailure)}`);
  yield* Console.log(`failure is null -> ${fromFailure === null}`);
});

const exampleNullableInterop = Effect.gen(function* () {
  yield* Console.log("Use getOrNull outputs with null-aware filtering.");
  const nullableValues = [
    ResultModule.getOrNull(ResultModule.succeed("alpha")),
    ResultModule.getOrNull(ResultModule.fail({ code: 404, reason: "missing" })),
    ResultModule.getOrNull(ResultModule.succeed("beta")),
  ];
  const presentValues = nullableValues.filter((value): value is string => value !== null);

  yield* Console.log(`nullable values -> ${formatUnknown(nullableValues)}`);
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
      title: "Source-Aligned Nullable Unwrap",
      description: "Run the documented succeed/fail invocations and observe `null` on failure.",
      run: exampleSourceAlignedUnwrap,
    },
    {
      title: "Nullable Interop Workflow",
      description: "Map multiple Result values to nullable outputs and filter non-null successes.",
      run: exampleNullableInterop,
    },
  ],
});

BunRuntime.runMain(program);
