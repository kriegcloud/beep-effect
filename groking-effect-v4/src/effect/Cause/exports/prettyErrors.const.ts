/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: prettyErrors
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Converts a {@link Cause} into an `Array<Error>` suitable for logging or rethrowing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail(new Error("boom"))
 * const errors = Cause.prettyErrors(cause)
 * console.log(errors[0].message) // "boom"
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
const exportName = "prettyErrors";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Converts a {@link Cause} into an `Array<Error>` suitable for logging or rethrowing.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.fail(new Error("boom"))\nconst errors = Cause.prettyErrors(cause)\nconsole.log(errors[0].message) // "boom"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect prettyErrors as a callable rendering helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedErrorExtraction = Effect.gen(function* () {
  yield* Console.log('Convert a fail(new Error("boom")) cause, matching the source example.');

  const cause = CauseModule.fail(new Error("boom"));
  const errors = CauseModule.prettyErrors(cause);
  const first = errors[0];

  yield* Console.log(`error count: ${errors.length}`);
  yield* Console.log(`first error: ${first?.name ?? "<missing>"}: ${first?.message ?? "<missing>"}`);
});

const exampleMixedFailDieAndInterrupt = Effect.gen(function* () {
  yield* Console.log("Fail and die reasons become separate Errors; interrupts are auxiliary.");

  const failAndDie = CauseModule.combine(CauseModule.fail("typed failure"), CauseModule.die("defect boom"));
  const mixedCause = CauseModule.combine(failAndDie, CauseModule.interrupt(7));
  const errors = CauseModule.prettyErrors(mixedCause);
  const messages = errors.map((error) => error.message).join(" | ");

  yield* Console.log(`error count: ${errors.length}`);
  yield* Console.log(`messages: ${messages}`);
});

const exampleInterruptOnlyFallback = Effect.gen(function* () {
  yield* Console.log("Interrupt-only causes map to one InterruptError with interrupt metadata.");

  const interruptCause = CauseModule.combine(CauseModule.interrupt(3), CauseModule.interrupt(9));
  const errors = CauseModule.prettyErrors(interruptCause);
  const first = errors[0];
  const interruptCauseError = first?.cause as Error | undefined;
  const interruptStack = String(interruptCauseError?.stack ?? "");

  yield* Console.log(`error count: ${errors.length}`);
  yield* Console.log(`first error: ${first?.name ?? "<missing>"}: ${first?.message ?? "<missing>"}`);
  yield* Console.log(`lists #3 and #9: ${interruptStack.includes("#3") && interruptStack.includes("#9")}`);
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
      title: "Source-Aligned Error Extraction",
      description: 'Convert fail(new Error("boom")) and inspect the resulting Error output.',
      run: exampleSourceAlignedErrorExtraction,
    },
    {
      title: "Mixed Fail / Die / Interrupt Cause",
      description: "Show that fail and die reasons each produce an Error in order.",
      run: exampleMixedFailDieAndInterrupt,
    },
    {
      title: "Interrupt-Only Fallback",
      description: "Show the single InterruptError returned when no fail/die reasons exist.",
      run: exampleInterruptOnlyFallback,
    },
  ],
});

BunRuntime.runMain(program);
