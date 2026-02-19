/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: let
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
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
const exportName = "let";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Derive a pure field from the current success accumulator and append it during do-notation composition.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.Do,\n  Result.bind("x", () => Result.succeed(2)),\n  Result.bind("y", () => Result.succeed(3)),\n  Result.let("sum", ({ x, y }) => x + y)\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: { x: 2, y: 3, sum: 5 }, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.let as the do-notation helper for derived fields.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeResult = (result: ResultModule.Result<unknown, unknown>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: (value) => `Success(${formatUnknown(value)})`,
  })(result);

const exampleSourceAlignedLet = Effect.gen(function* () {
  yield* Console.log("Compute a pure field from already-bound values.");
  const result = ResultModule.Do.pipe(
    ResultModule.bind("subtotal", () => ResultModule.succeed(120)),
    ResultModule.bind("discount", ({ subtotal }) => ResultModule.succeed(subtotal >= 100 ? 15 : 0)),
    ResultModule.let("total", ({ subtotal, discount }) => subtotal - discount)
  );

  yield* Console.log(`result: ${summarizeResult(result)}`);
  const total = ResultModule.isSuccess(result) ? `${result.success.total}` : "unavailable";
  yield* Console.log(`total: ${total}`);
});

const exampleFailureSkipsLetMapper = Effect.gen(function* () {
  yield* Console.log("A prior failure keeps the failure and skips the let mapper.");
  let mapperInvoked = false;

  const result = ResultModule.Do.pipe(
    ResultModule.bind("subtotal", () => ResultModule.succeed(120)),
    ResultModule.bind("discount", () => ResultModule.fail("discount-unavailable")),
    ResultModule.let("total", ({ subtotal, discount }) => {
      mapperInvoked = true;
      return subtotal - discount;
    })
  );

  yield* Console.log(`result: ${summarizeResult(result)}`);
  yield* Console.log(`mapperInvoked: ${mapperInvoked}`);
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
      title: "Source-Aligned let Composition",
      description: "Use let to derive a pure field from previously bound accumulator values.",
      run: exampleSourceAlignedLet,
    },
    {
      title: "Failure Short-Circuit",
      description: "Show that let is not evaluated when an earlier bind has already failed.",
      run: exampleFailureSkipsLetMapper,
    },
  ],
});

BunRuntime.runMain(program);
