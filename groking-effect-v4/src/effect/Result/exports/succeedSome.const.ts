/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: succeedSome
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Creates a `Result<Option<A>>` that succeeds with `Some(a)`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * const result = Result.succeedSome(42)
 * console.log(result)
 * // Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }
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
import * as O from "effect/Option";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "succeedSome";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Creates a `Result<Option<A>>` that succeeds with `Some(a)`.";
const sourceExample =
  'import { Result } from "effect"\n\nconst result = Result.succeedSome(42)\nconsole.log(result)\n// Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect succeedSome as a runtime constructor for Result<Option<A>> values.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeOptionResult = <A, E>(result: ResultModule.Result<O.Option<A>, E>): string =>
  ResultModule.match({
    onFailure: (failure) => `Failure(${formatUnknown(failure)})`,
    onSuccess: O.match({
      onNone: () => "Success(None)",
      onSome: (value) => `Success(Some(${formatUnknown(value)}))`,
    }),
  })(result);

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const result = ResultModule.succeedSome(42);

  yield* Console.log(`succeedSome(42) -> ${summarizeOptionResult(result)}`);
  yield* Console.log(`isSuccess: ${ResultModule.isSuccess(result)}`);

  if (ResultModule.isSuccess(result)) {
    const payload = O.match({
      onNone: () => "None",
      onSome: (value: number) => `Some(${value})`,
    })(result.success);
    yield* Console.log(`payload: ${payload}`);
  }
});

const exampleEquivalentConstructor = Effect.gen(function* () {
  const viaSucceedSome = ResultModule.succeedSome("alpha");
  const viaSucceedAndSome = ResultModule.succeed(O.some("alpha"));
  const sameStructure = JSON.stringify(viaSucceedSome) === JSON.stringify(viaSucceedAndSome);

  yield* Console.log(`succeedSome("alpha") -> ${summarizeOptionResult(viaSucceedSome)}`);
  yield* Console.log(`succeed(Option.some("alpha")) -> ${summarizeOptionResult(viaSucceedAndSome)}`);
  yield* Console.log(`same structure: ${sameStructure}`);
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
      title: "Source-Aligned Some Construction",
      description: "Create the documented Success(Some(value)) result and inspect the payload.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Constructor Equivalence",
      description: "Show that succeedSome(a) matches succeed(Option.some(a)).",
      run: exampleEquivalentConstructor,
    },
  ],
});

BunRuntime.runMain(program);
