/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: squash
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Collapses a {@link Cause} into a single `unknown` value, picking the "most important" failure in this order:
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.squash(Cause.fail("error")))    // "error"
 * console.log(Cause.squash(Cause.die("defect")))    // "defect"
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

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "squash";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  'Collapses a {@link Cause} into a single `unknown` value, picking the "most important" failure in this order:';
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.squash(Cause.fail("error")))    // "error"\nconsole.log(Cause.squash(Cause.die("defect")))    // "defect"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect squash as a callable export that collapses causes to one value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedSquash = Effect.gen(function* () {
  yield* Console.log("Run the source-aligned fail and die examples.");

  const squashedFail = CauseModule.squash(CauseModule.fail("error"));
  const squashedDie = CauseModule.squash(CauseModule.die("defect"));

  yield* Console.log(`squash(fail("error")): ${formatUnknown(squashedFail)}`);
  yield* Console.log(`squash(die("defect")): ${formatUnknown(squashedDie)}`);
});

const examplePriorityAndFallback = Effect.gen(function* () {
  yield* Console.log("Fail reasons win over Die reasons; interrupt-only and empty causes return fallback Errors.");

  const failThenDie = CauseModule.combine(CauseModule.fail("typed-first"), CauseModule.die("defect-second"));
  const dieThenFail = CauseModule.combine(CauseModule.die("defect-first"), CauseModule.fail("typed-second"));
  const interruptOnly = CauseModule.interrupt(42);
  const emptyCause = CauseModule.empty;

  const squashedFailThenDie = CauseModule.squash(failThenDie);
  const squashedDieThenFail = CauseModule.squash(dieThenFail);
  const squashedInterruptOnly = CauseModule.squash(interruptOnly);
  const squashedEmpty = CauseModule.squash(emptyCause);

  yield* Console.log(`squash(fail+die): ${formatUnknown(squashedFailThenDie)}`);
  yield* Console.log(`squash(die+fail): ${formatUnknown(squashedDieThenFail)}`);
  yield* Console.log(
    `interrupt fallback mentions interruption: ${
      squashedInterruptOnly instanceof Error && squashedInterruptOnly.message.includes("interrupted")
    }`
  );
  yield* Console.log(
    `empty fallback mentions empty cause: ${squashedEmpty instanceof Error && squashedEmpty.message.includes("Empty cause")}`
  );
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
      title: "Source-Aligned Fail And Die",
      description: "Call squash with fail and die causes, matching the source JSDoc examples.",
      run: exampleSourceAlignedSquash,
    },
    {
      title: "Priority And Fallback Contract",
      description: "Show fail-over-die priority and the fallback Error behavior for interrupt/empty causes.",
      run: examplePriorityAndFallback,
    },
  ],
});

BunRuntime.runMain(program);
