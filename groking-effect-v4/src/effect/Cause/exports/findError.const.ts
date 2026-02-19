/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Returns the first typed error value `E` from a cause. Returns `Filter.fail` with the remaining cause when no `Fail` is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findError(Cause.fail("error"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success) // "error"
 * }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findError";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Returns the first typed error value `E` from a cause. Returns `Filter.fail` with the remaining cause when no `Fail` is found.";
const sourceExample =
  'import { Cause, Result } from "effect"\n\nconst result = Cause.findError(Cause.fail("error"))\nif (!Result.isFailure(result)) {\n  console.log(result.success) // "error"\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect findError as a callable export that extracts typed Fail errors.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedErrorLookup = Effect.gen(function* () {
  yield* Console.log("Use the source-aligned call shape: pass a fail cause and read the typed error.");

  const typedError = { code: "E_PARSE", retryable: false as const };
  const result = CauseModule.findError(CauseModule.fail(typedError));

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (!ResultModule.isFailure(result)) {
    yield* Console.log(`extracted error: ${formatUnknown(result.success)}`);
    yield* Console.log(`error identity preserved: ${result.success === typedError}`);
  }
});

const exampleNoFailContract = Effect.gen(function* () {
  yield* Console.log("When a cause has no Fail reason, findError stays in the failure channel.");

  const noFailCause = CauseModule.combine(CauseModule.die("unexpected-defect"), CauseModule.interrupt(7));
  const result = CauseModule.findError(noFailCause);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (ResultModule.isFailure(result)) {
    yield* Console.log(`failure has typed errors: ${CauseModule.hasFails(result.failure)}`);
    yield* Console.log(`failure has defects: ${CauseModule.hasDies(result.failure)}`);
  }
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
      title: "Source-Aligned Error Lookup",
      description: "Call findError with a fail cause and verify typed error extraction.",
      run: exampleSourceAlignedErrorLookup,
    },
    {
      title: "No-Fail Failure Contract",
      description: "Show the failure-path behavior when a cause has no fail reason.",
      run: exampleNoFailContract,
    },
  ],
});

BunRuntime.runMain(program);
