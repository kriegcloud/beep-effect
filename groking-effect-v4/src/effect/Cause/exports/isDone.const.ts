/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isDone
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Tests if an arbitrary value is a {@link Done} signal.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isDone(Cause.Done())) // true
 * console.log(Cause.isDone("not done"))   // false
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isDone";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is a {@link Done} signal.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.isDone(Cause.Done())) // true\nconsole.log(Cause.isDone("not done"))   // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect isDone as a runtime value and confirm expected guard arity.");
  yield* inspectNamedExport({ moduleRecord, exportName });

  const isDoneExport = moduleRecord[exportName];
  if (typeof isDoneExport === "function") {
    yield* Console.log(`isDone.length (expected 1 unknown arg): ${isDoneExport.length}`);
  }
});

const exampleSourceAlignedGuardChecks = Effect.gen(function* () {
  const doneSignal = CauseModule.Done();
  const nonDoneValue = "not done";
  const lookalikeDone = { _tag: "Done", value: "done" };

  yield* Console.log(`isDone(Cause.Done()): ${CauseModule.isDone(doneSignal)}`);
  yield* Console.log(`isDone("not done"): ${CauseModule.isDone(nonDoneValue)}`);
  yield* Console.log(`isDone({_tag:"Done", value:"done"}): ${CauseModule.isDone(lookalikeDone)}`);
});

const exampleDoneFailureExtraction = Effect.gen(function* () {
  const completion = { stream: "orders", drained: true };
  const exit = yield* Effect.exit(CauseModule.done(completion));

  if (Exit.isFailure(exit)) {
    const firstReason = exit.cause.reasons[0];
    if (firstReason !== undefined && CauseModule.isFailReason(firstReason)) {
      const failError = firstReason.error;
      yield* Console.log(`Fail reason error is Done: ${CauseModule.isDone(failError)}`);

      if (CauseModule.isDone(failError)) {
        yield* Console.log(`Done payload: ${JSON.stringify(failError.value)}`);
      }
      return;
    }
  }

  yield* Console.log("Contract note: Cause.done(value) should fail with a Done error.");
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
      title: "Runtime Shape",
      description: "Inspect isDone and verify it is a unary runtime guard.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Guard Checks",
      description: "Run the documented Done/non-Done checks plus a structural lookalike value.",
      run: exampleSourceAlignedGuardChecks,
    },
    {
      title: "Done from Effect Failure",
      description: "Show Cause.done(value) fails with a Done error recognized by isDone.",
      run: exampleDoneFailureExtraction,
    },
  ],
});

BunRuntime.runMain(program);
