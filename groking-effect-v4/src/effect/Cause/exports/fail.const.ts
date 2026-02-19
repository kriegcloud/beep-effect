/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: fail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Creates a {@link Cause} containing a single {@link Fail} reason with the given typed error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("Something went wrong")
 * console.log(cause.reasons.length) // 1
 * console.log(Cause.isFailReason(cause.reasons[0])) // true
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
const exportName = "fail";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Creates a {@link Cause} containing a single {@link Fail} reason with the given typed error.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.fail("Something went wrong")\nconsole.log(cause.reasons.length) // 1\nconsole.log(Cause.isFailReason(cause.reasons[0])) // true';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect fail as a callable constructor for typed error causes.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedCreation = Effect.gen(function* () {
  yield* Console.log("Create a fail cause and verify the first reason is a Fail.");
  const typedError = "Something went wrong";
  const cause = CauseModule.fail(typedError);
  const firstReason = cause.reasons[0];
  const isFailReason = firstReason !== undefined && CauseModule.isFailReason(firstReason);

  yield* Console.log(`reasons.length: ${cause.reasons.length}`);
  yield* Console.log(`first reason is Fail: ${isFailReason}`);
  yield* Console.log(`hasFails: ${CauseModule.hasFails(cause)}`);
  yield* Console.log(`hasDies: ${CauseModule.hasDies(cause)}`);
  if (isFailReason) {
    yield* Console.log(`error matches input: ${firstReason.error === typedError}`);
  }
});

const exampleFindErrorContract = Effect.gen(function* () {
  yield* Console.log("findError returns typed fail values and fails for die-only causes.");
  const failCause = CauseModule.fail({ code: "E_PARSE", retryable: false as const });
  const dieCause = CauseModule.die("unexpected-defect");

  const errorFromFail = CauseModule.findError(failCause);
  const errorFromDie = CauseModule.findError(dieCause);

  yield* Console.log(`findError(failCause) failed: ${ResultModule.isFailure(errorFromFail)}`);
  if (!ResultModule.isFailure(errorFromFail)) {
    yield* Console.log(`typed error: ${formatUnknown(errorFromFail.success)}`);
  }
  yield* Console.log(`findError(dieCause) failed: ${ResultModule.isFailure(errorFromDie)}`);
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
      title: "Create a Fail Cause",
      description: "Use the source-aligned string input and verify fail-specific predicates.",
      run: exampleSourceAlignedCreation,
    },
    {
      title: "Find Error Contract",
      description: "Show typed fail extraction success and the expected failure path for die causes.",
      run: exampleFindErrorContract,
    },
  ],
});

BunRuntime.runMain(program);
