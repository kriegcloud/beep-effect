/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Cause
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.183Z
 *
 * Overview:
 * A structured representation of how an Effect failed.
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
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Cause";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A structured representation of how an Effect failed.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.fail("Something went wrong")\nconsole.log(cause.reasons.length) // 1\nconsole.log(Cause.isFailReason(cause.reasons[0])) // true';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("`Cause` is an interface, so the symbol is erased at runtime.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleCompanionExportInspection = Effect.gen(function* () {
  yield* Console.log("Bridge to runtime: inspect the `fail` companion constructor export.");
  yield* inspectNamedExport({ moduleRecord, exportName: "fail" });
});

const exampleSourceAlignedCompanionFlow = Effect.gen(function* () {
  yield* Console.log("Use companion APIs to construct and inspect a runtime `Cause` value.");

  const cause = CauseModule.fail("Something went wrong");
  const firstReason = cause.reasons[0];
  const firstReasonIsFail = firstReason !== undefined && CauseModule.isFailReason(firstReason);
  const failErrors = cause.reasons.filter(CauseModule.isFailReason).map((reason) => String(reason.error));

  yield* Console.log(`cause.reasons.length: ${cause.reasons.length}`);
  yield* Console.log(`Cause.isFailReason(cause.reasons[0]): ${firstReasonIsFail}`);
  yield* Console.log(`Fail errors: ${failErrors.join(", ")}`);
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Companion Export Inspection",
      description: "Inspect the runtime `fail` constructor that creates `Cause` values.",
      run: exampleCompanionExportInspection,
    },
    {
      title: "Source-Aligned Companion Flow",
      description: "Run `fail` and `isFailReason` to mirror the source JSDoc behavior.",
      run: exampleSourceAlignedCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
