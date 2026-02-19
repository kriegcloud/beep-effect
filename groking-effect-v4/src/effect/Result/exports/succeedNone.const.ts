/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: succeedNone
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * A pre-built `Result<Option<never>>` that succeeds with `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.isSuccess(Result.succeedNone))
 * // Output: true
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "succeedNone";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "A pre-built `Result<Option<never>>` that succeeds with `None`.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.isSuccess(Result.succeedNone))\n// Output: true';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect succeedNone as a pre-built Result value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedIsSuccess = Effect.gen(function* () {
  const result = ResultModule.succeedNone;
  const isSuccess = ResultModule.isSuccess(result);

  yield* Console.log(`isSuccess(succeedNone): ${isSuccess}`);
  if (isSuccess) {
    yield* Console.log(`success payload is None: ${O.isNone(result.success)}`);
  }
});

const exampleSuccessExtraction = Effect.gen(function* () {
  const extractedSuccess = ResultModule.getSuccess(ResultModule.succeedNone);
  const merged = ResultModule.merge(ResultModule.succeedNone);

  yield* Console.log(`getSuccess(succeedNone) is Some: ${O.isSome(extractedSuccess)}`);
  if (O.isSome(extractedSuccess)) {
    yield* Console.log(`inner payload is None: ${O.isNone(extractedSuccess.value)}`);
  }
  yield* Console.log(`merge(succeedNone) is None: ${O.isNone(merged)}`);
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
      title: "Source-Aligned Success Check",
      description: "Reproduce the JSDoc behavior and confirm succeedNone is a Success containing None.",
      run: exampleSourceAlignedIsSuccess,
    },
    {
      title: "Option Extraction From Success",
      description: "Inspect nested Option behavior via getSuccess and merge on the pre-built value.",
      run: exampleSuccessExtraction,
    },
  ],
});

BunRuntime.runMain(program);
