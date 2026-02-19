/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: hasFails
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * Returns `true` if the cause contains at least one {@link Fail} reason.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasFails(Cause.fail("error"))) // true
 * console.log(Cause.hasFails(Cause.die("defect"))) // false
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
const exportName = "hasFails";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Returns `true` if the cause contains at least one {@link Fail} reason.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.hasFails(Cause.fail("error"))) // true\nconsole.log(Cause.hasFails(Cause.die("defect"))) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect hasFails as a callable predicate over Cause values.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedFailVsDie = Effect.gen(function* () {
  yield* Console.log("Source-aligned behavior: fail causes are true, die causes are false.");

  const failCause = CauseModule.fail("error");
  const dieCause = CauseModule.die("defect");

  yield* Console.log(`hasFails(Cause.fail("error")): ${CauseModule.hasFails(failCause)}`);
  yield* Console.log(`hasFails(Cause.die("defect")): ${CauseModule.hasFails(dieCause)}`);
});

const exampleCombinedCauseScan = Effect.gen(function* () {
  yield* Console.log("Combined causes flip to true once at least one Fail reason is present.");

  const noTypedFails = CauseModule.combine(CauseModule.die("defect-1"), CauseModule.die("defect-2"));
  const withTypedFail = CauseModule.combine(noTypedFails, CauseModule.fail({ code: "E_PARSE" }));

  yield* Console.log(`hasFails(noTypedFails): ${CauseModule.hasFails(noTypedFails)}`);
  yield* Console.log(`hasFails(withTypedFail): ${CauseModule.hasFails(withTypedFail)}`);
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
      title: "Source-Aligned Fail Vs Die",
      description: "Run the documented fail and die inputs to verify boolean predicate outcomes.",
      run: exampleSourceAlignedFailVsDie,
    },
    {
      title: "Combined Cause Scan",
      description: "Show that hasFails is false for die-only causes and true once a fail reason is added.",
      run: exampleCombinedCauseScan,
    },
  ],
});

BunRuntime.runMain(program);
