/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: hasDies
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * Returns `true` if the cause contains at least one {@link Die} reason.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasDies(Cause.die("defect"))) // true
 * console.log(Cause.hasDies(Cause.fail("error"))) // false
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
const exportName = "hasDies";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Returns `true` if the cause contains at least one {@link Die} reason.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.hasDies(Cause.die("defect"))) // true\nconsole.log(Cause.hasDies(Cause.fail("error"))) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect hasDies as a callable predicate over Cause values.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedDetection = Effect.gen(function* () {
  yield* Console.log("Run the documented die vs fail checks.");
  const dieCause = CauseModule.die("defect");
  const failCause = CauseModule.fail("error");

  yield* Console.log(`hasDies(die): ${CauseModule.hasDies(dieCause)}`);
  yield* Console.log(`hasDies(fail): ${CauseModule.hasDies(failCause)}`);
  yield* Console.log(`hasFails(fail): ${CauseModule.hasFails(failCause)}`);
});

const exampleCompositeCauseDetection = Effect.gen(function* () {
  yield* Console.log("Detect Die reasons inside combined causes.");
  const failCause = CauseModule.fail("typed-error");
  const interruptCause = CauseModule.interrupt(7);
  const dieCause = CauseModule.die(new Error("panic"));
  const withoutDie = CauseModule.combine(failCause, interruptCause);
  const withDie = CauseModule.combine(withoutDie, dieCause);

  yield* Console.log(`hasDies(empty): ${CauseModule.hasDies(CauseModule.empty)}`);
  yield* Console.log(`hasDies(withoutDie): ${CauseModule.hasDies(withoutDie)}`);
  yield* Console.log(`hasDies(withDie): ${CauseModule.hasDies(withDie)}`);
  yield* Console.log(`hasInterrupts(withDie): ${CauseModule.hasInterrupts(withDie)}`);
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
      title: "Source-Aligned Die Detection",
      description: "Reproduce the documented die vs fail inputs and compare predicate output.",
      run: exampleSourceAlignedDetection,
    },
    {
      title: "Composite Cause Detection",
      description: "Show that hasDies stays false until a die reason is present in a combined cause.",
      run: exampleCompositeCauseDetection,
    },
  ],
});

BunRuntime.runMain(program);
