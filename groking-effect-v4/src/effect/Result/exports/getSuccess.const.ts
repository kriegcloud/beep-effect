/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: getSuccess
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Extracts the success value as an `Option`, discarding the failure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * console.log(Result.getSuccess(Result.succeed("ok")))
 * // Output: { _tag: "Some", value: "ok" }
 *
 * console.log(Result.getSuccess(Result.fail("err")))
 * // Output: { _tag: "None" }
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
const exportName = "getSuccess";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Extracts the success value as an `Option`, discarding the failure.";
const sourceExample =
  'import { Option, Result } from "effect"\n\nconsole.log(Result.getSuccess(Result.succeed("ok")))\n// Output: { _tag: "Some", value: "ok" }\n\nconsole.log(Result.getSuccess(Result.fail("err")))\n// Output: { _tag: "None" }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect getSuccess as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const fromSuccess = ResultModule.getSuccess(ResultModule.succeed("ok"));
  const fromFailure = ResultModule.getSuccess(ResultModule.fail("err"));

  yield* Console.log(`getSuccess(succeed("ok")) => ${formatUnknown(fromSuccess)}`);
  yield* Console.log(`getSuccess(fail("err")) => ${formatUnknown(fromFailure)}`);
});

const describeSuccess = O.match({
  onNone: () => "no success value",
  onSome: (value: number) => `success captured: ${value}`,
});

const exampleSuccessOnlyBranching = Effect.gen(function* () {
  const readPort = (raw: string): ResultModule.Result<number, string> => {
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 && parsed <= 65_535
      ? ResultModule.succeed(parsed)
      : ResultModule.fail(`invalid port: ${raw}`);
  };

  const validSuccess = ResultModule.getSuccess(readPort("8080"));
  const invalidSuccess = ResultModule.getSuccess(readPort("not-a-port"));

  yield* Console.log(`readPort("8080") => ${describeSuccess(validSuccess)}`);
  yield* Console.log(`readPort("not-a-port") => ${describeSuccess(invalidSuccess)}`);
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
      title: "Source-Aligned Success Extraction",
      description: "Reproduce the documented Success/Failure conversions into Option.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Success-Only Branching",
      description: "Use Option matching after getSuccess when only the success channel matters.",
      run: exampleSuccessOnlyBranching,
    },
  ],
});

BunRuntime.runMain(program);
