/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: getOrElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Extracts the success value, or computes a fallback from the error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.getOrElse(Result.succeed(1), () => 0))
 * // Output: 1
 *
 * console.log(Result.getOrElse(Result.fail("err"), () => 0))
 * // Output: 0
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
const exportName = "getOrElse";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Extracts the success value, or computes a fallback from the error.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.getOrElse(Result.succeed(1), () => 0))\n// Output: 1\n\nconsole.log(Result.getOrElse(Result.fail("err"), () => 0))\n// Output: 0';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.getOrElse as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFallback = Effect.gen(function* () {
  yield* Console.log("Use getOrElse(result, onFailure) with success and failure.");
  const fallbackToZero = () => 0;
  const fromSuccess = ResultModule.getOrElse(ResultModule.succeed(1), fallbackToZero);
  const fromFailure = ResultModule.getOrElse(ResultModule.fail("err"), fallbackToZero);

  yield* Console.log(`succeed(1) -> ${formatUnknown(fromSuccess)}`);
  yield* Console.log(`fail("err") -> ${formatUnknown(fromFailure)}`);
});

const exampleCurriedErrorAwareFallback = Effect.gen(function* () {
  yield* Console.log("Use curried getOrElse(onFailure)(result) and read the failure cause.");
  let onFailureCalls = 0;

  const describeFailure = ResultModule.getOrElse((err: { code: number; message: string }) => {
    onFailureCalls += 1;
    return `fallback(${err.code}): ${err.message}`;
  });

  const successValue = describeFailure(ResultModule.succeed("ok"));
  const successCalls = onFailureCalls;
  const fallbackValue = describeFailure(ResultModule.fail({ code: 503, message: "unavailable" }));
  const failureCalls = onFailureCalls;

  yield* Console.log(`curried succeed("ok") -> ${formatUnknown(successValue)} (onFailure calls: ${successCalls})`);
  yield* Console.log(
    `curried fail({ code: 503, ... }) -> ${formatUnknown(fallbackValue)} (onFailure calls: ${failureCalls})`
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
      title: "Source-Aligned Fallback",
      description: "Run the JSDoc-style success/failure examples with a constant fallback.",
      run: exampleSourceAlignedFallback,
    },
    {
      title: "Curried Error-Aware Fallback",
      description: "Use the curried form to compute fallback values from the failure payload.",
      run: exampleCurriedErrorAwareFallback,
    },
  ],
});

BunRuntime.runMain(program);
