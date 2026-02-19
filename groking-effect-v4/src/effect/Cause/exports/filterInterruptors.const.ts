/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: filterInterruptors
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Extracts the set of interrupting fiber IDs from a cause. Returns `Filter.fail` with the original cause when no {@link Interrupt} reason is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.filterInterruptors(Cause.interrupt(1))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success) // Set { 1 }
 * }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filterInterruptors";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Extracts the set of interrupting fiber IDs from a cause. Returns `Filter.fail` with the original cause when no {@link Interrupt} reason is found.";
const sourceExample =
  'import { Cause, Result } from "effect"\n\nconst result = Cause.filterInterruptors(Cause.interrupt(1))\nif (!Result.isFailure(result)) {\n  console.log(result.success) // Set { 1 }\n}';

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleSourceAlignedSuccess = Effect.gen(function* () {
  const result = CauseModule.filterInterruptors(CauseModule.interrupt(1));

  if (Result.isFailure(result)) {
    yield* Console.log("Cause.interrupt(1) unexpectedly produced Filter.fail.");
    return;
  }

  yield* Console.log(`Cause.interrupt(1) -> interruptor IDs [${Array.from(result.success).join(", ")}]`);
});

const exampleNoInterruptsReturnsFilterFail = Effect.gen(function* () {
  const typedFailureCause = CauseModule.fail("boom");
  const result = CauseModule.filterInterruptors(typedFailureCause);

  if (Result.isFailure(result)) {
    yield* Console.log(
      `No interrupt reasons -> Filter.fail (returned cause hasInterrupts=${CauseModule.hasInterrupts(result.failure)})`
    );
    return;
  }

  yield* Console.log("Unexpected success for a cause without interrupts.");
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
      title: "Extract IDs From Interrupt Cause",
      description: "Source-aligned invocation: a cause with one interrupt succeeds with Set(1).",
      run: exampleSourceAlignedSuccess,
    },
    {
      title: "No Interrupts Triggers Filter.fail",
      description: "A cause with no Interrupt reasons fails and carries the original cause.",
      run: exampleNoInterruptsReturnsFilterFail,
    },
  ],
});

BunRuntime.runMain(program);
