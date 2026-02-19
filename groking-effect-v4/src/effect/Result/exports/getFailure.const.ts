/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: getFailure
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Extracts the failure value as an `Option`, discarding the success.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * console.log(Result.getFailure(Result.succeed("ok")))
 * // Output: { _tag: "None" }
 *
 * console.log(Result.getFailure(Result.fail("err")))
 * // Output: { _tag: "Some", value: "err" }
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
const exportName = "getFailure";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Extracts the failure value as an `Option`, discarding the success.";
const sourceExample =
  'import { Option, Result } from "effect"\n\nconsole.log(Result.getFailure(Result.succeed("ok")))\n// Output: { _tag: "None" }\n\nconsole.log(Result.getFailure(Result.fail("err")))\n// Output: { _tag: "Some", value: "err" }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect getFailure as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const fromSuccess = ResultModule.getFailure(ResultModule.succeed("ok"));
  const fromFailure = ResultModule.getFailure(ResultModule.fail("err"));

  yield* Console.log(`getFailure(succeed("ok")) => ${formatUnknown(fromSuccess)}`);
  yield* Console.log(`getFailure(fail("err")) => ${formatUnknown(fromFailure)}`);
});

const describeFailure = O.match({
  onNone: () => "no failure",
  onSome: (failure: string) => `failure captured: ${failure}`,
});

const exampleFailureOnlyBranching = Effect.gen(function* () {
  const readThreshold = (raw: string): ResultModule.Result<number, string> => {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? ResultModule.succeed(parsed) : ResultModule.fail(`invalid number: ${raw}`);
  };

  const validFailure = ResultModule.getFailure(readThreshold("42"));
  const invalidFailure = ResultModule.getFailure(readThreshold("forty-two"));

  yield* Console.log(`readThreshold("42") => ${describeFailure(validFailure)}`);
  yield* Console.log(`readThreshold("forty-two") => ${describeFailure(invalidFailure)}`);
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
      title: "Source-Aligned Failure Extraction",
      description: "Reproduce the documented Success/Failure conversions into Option.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Failure-Only Branching",
      description: "Use Option matching after getFailure when only the error channel matters.",
      run: exampleFailureOnlyBranching,
    },
  ],
});

BunRuntime.runMain(program);
