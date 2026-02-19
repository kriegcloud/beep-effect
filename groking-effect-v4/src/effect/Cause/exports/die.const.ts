/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: die
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Creates a {@link Cause} containing a single {@link Die} reason with the given defect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.die(new Error("Unexpected"))
 * console.log(cause.reasons.length) // 1
 * console.log(Cause.isDieReason(cause.reasons[0])) // true
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
const exportName = "die";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Creates a {@link Cause} containing a single {@link Die} reason with the given defect.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.die(new Error("Unexpected"))\nconsole.log(cause.reasons.length) // 1\nconsole.log(Cause.isDieReason(cause.reasons[0])) // true';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect die as a callable constructor for defect causes.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedCreation = Effect.gen(function* () {
  yield* Console.log("Create a die cause and verify the first reason is a Die.");
  const defect = new Error("Unexpected");
  const cause = CauseModule.die(defect);
  const firstReason = cause.reasons[0];
  const isDieReason = firstReason !== undefined && CauseModule.isDieReason(firstReason);

  yield* Console.log(`reasons.length: ${cause.reasons.length}`);
  yield* Console.log(`first reason is Die: ${isDieReason}`);
  yield* Console.log(`hasDies: ${CauseModule.hasDies(cause)}`);
  yield* Console.log(`hasFails: ${CauseModule.hasFails(cause)}`);
  if (isDieReason) {
    yield* Console.log(`defect identity preserved: ${firstReason.defect === defect}`);
  }
});

const exampleFindDefectContract = Effect.gen(function* () {
  yield* Console.log("findDefect succeeds for die causes and fails for typed fail causes.");
  const dieResult = CauseModule.findDefect(CauseModule.die({ code: "E_UNEXPECTED", retriable: false }));
  const failResult = CauseModule.findDefect(CauseModule.fail("typed-error"));

  yield* Console.log(`die lookup failed: ${ResultModule.isFailure(dieResult)}`);
  if (!ResultModule.isFailure(dieResult)) {
    yield* Console.log(`die defect: ${formatUnknown(dieResult.success)}`);
  }

  yield* Console.log(`fail lookup failed: ${ResultModule.isFailure(failResult)}`);
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
      title: "Create a Die Cause",
      description: "Use the source-aligned Error input and verify Die-specific predicates.",
      run: exampleSourceAlignedCreation,
    },
    {
      title: "Find Defect Behavior",
      description: "Show success for die causes and the expected failure path for fail causes.",
      run: exampleFindDefectContract,
    },
  ],
});

BunRuntime.runMain(program);
