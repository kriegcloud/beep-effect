/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: done
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Creates an Effect that fails with a {@link Done} error. Shorthand for `Effect.fail(Cause.Done(value))`.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
const exportName = "done";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Creates an Effect that fails with a {@link Done} error. Shorthand for `Effect.fail(Cause.Done(value))`.";
const sourceExample = "";
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect done as a runtime value and confirm call arity.");
  yield* inspectNamedExport({ moduleRecord, exportName });

  const doneExport = moduleRecord[exportName];
  if (typeof doneExport === "function") {
    yield* Console.log(`done.length (expected 1 value arg): ${doneExport.length}`);
  }
});

const exampleDoneFailureShape = Effect.gen(function* () {
  const completionValue = { stage: "persisted", id: 101 };
  const exit = yield* Effect.exit(CauseModule.done(completionValue));

  if (Exit.isFailure(exit)) {
    const reason = exit.cause.reasons[0];
    const isFailReason = reason !== undefined && CauseModule.isFailReason(reason);
    const doneError = reason !== undefined && CauseModule.isFailReason(reason) ? reason.error : undefined;

    yield* Console.log(`Exit tag: ${exit._tag}`);
    yield* Console.log(`Failure reasons: ${exit.cause.reasons.length}`);
    yield* Console.log(`First reason is Fail: ${isFailReason}`);
    yield* Console.log(`Fail error is Done: ${doneError !== undefined && CauseModule.isDone(doneError)}`);
    yield* Console.log(`Done value: ${JSON.stringify(doneError?.value)}`);
    return;
  }

  yield* Console.log("Contract note: done(...) should fail with a Done error.");
});

const exampleShorthandEquivalence = Effect.gen(function* () {
  const value = { job: "sync", attempt: 2 };
  const doneExit = yield* Effect.exit(CauseModule.done(value));
  const shorthandExit = yield* Effect.exit(Effect.fail(CauseModule.Done(value)));

  if (Exit.isFailure(doneExit) && Exit.isFailure(shorthandExit)) {
    const donePretty = CauseModule.pretty(doneExit.cause);
    const shorthandPretty = CauseModule.pretty(shorthandExit.cause);

    yield* Console.log(`done(...) cause: ${donePretty}`);
    yield* Console.log(`Effect.fail(Cause.Done(...)) cause: ${shorthandPretty}`);
    yield* Console.log(`Equivalent output: ${donePretty === shorthandPretty}`);
    return;
  }

  yield* Console.log("Contract note: both constructions should produce failing exits.");
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
      description: "Inspect the done export and verify it exposes one value parameter.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Done Failure Shape",
      description: "Run done(value) and verify the resulting failure contains a Done error with that value.",
      run: exampleDoneFailureShape,
    },
    {
      title: "Shorthand Equivalence",
      description: "Show done(value) matches Effect.fail(Cause.Done(value)) at runtime.",
      run: exampleShorthandEquivalence,
    },
  ],
});

BunRuntime.runMain(program);
