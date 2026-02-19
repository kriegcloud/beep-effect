/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isFailReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Narrows a {@link Reason} to {@link Fail}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("error")
 * const fails = cause.reasons.filter(Cause.isFailReason)
 * console.log(fails[0].error) // "error"
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

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isFailReason";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Narrows a {@link Reason} to {@link Fail}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.fail("error")\nconst fails = cause.reasons.filter(Cause.isFailReason)\nconsole.log(fails[0].error) // "error"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFiltering = Effect.gen(function* () {
  const cause = CauseModule.fail("error");
  const failReasons = cause.reasons.filter(CauseModule.isFailReason);
  const firstFail = failReasons[0];

  yield* Console.log(`cause.reasons.length => ${cause.reasons.length}`);
  yield* Console.log(`cause.reasons.filter(isFailReason).length => ${failReasons.length}`);
  yield* Console.log(`first fail error => ${firstFail?.error ?? "(none)"}`);
});

const exampleMixedReasonGuardChecks = Effect.gen(function* () {
  const failReason = CauseModule.makeFailReason("bad request");
  const dieReason = CauseModule.makeDieReason("defect");
  const interruptReason = CauseModule.makeInterruptReason(42);

  yield* Console.log(`isFailReason(Fail) => ${CauseModule.isFailReason(failReason)}`);
  yield* Console.log(`isFailReason(Die) => ${CauseModule.isFailReason(dieReason)}`);
  yield* Console.log(`isFailReason(Interrupt) => ${CauseModule.isFailReason(interruptReason)}`);
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
      title: "Source-Aligned Reason Filtering",
      description: "Mirror JSDoc filtering on `cause.reasons` and read the narrowed `.error` field.",
      run: exampleSourceAlignedFiltering,
    },
    {
      title: "Mixed Reason Guard Checks",
      description: "Show `true` for `Fail` and `false` for `Die` / `Interrupt` reasons.",
      run: exampleMixedReasonGuardChecks,
    },
  ],
});

BunRuntime.runMain(program);
