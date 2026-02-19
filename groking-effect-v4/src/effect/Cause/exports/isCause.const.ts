/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Tests if an arbitrary value is a {@link Cause}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isCause(Cause.fail("error"))) // true
 * console.log(Cause.isCause("not a cause")) // false
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
const exportName = "isCause";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is a {@link Cause}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.isCause(Cause.fail("error"))) // true\nconsole.log(Cause.isCause("not a cause")) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect isCause as a runtime predicate value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedGuard = Effect.gen(function* () {
  const failureCause = CauseModule.fail("error");
  const nonCause = "not a cause";

  yield* Console.log(`isCause(Cause.fail("error")): ${CauseModule.isCause(failureCause)}`);
  yield* Console.log(`isCause("not a cause"): ${CauseModule.isCause(nonCause)}`);
});

const exampleMixedCandidates = Effect.gen(function* () {
  const candidates: Array<{ readonly label: string; readonly value: unknown }> = [
    { label: "Cause.empty", value: CauseModule.empty },
    { label: "Cause.interrupt()", value: CauseModule.interrupt() },
    {
      label: 'Cause.combine(Cause.fail("boom"), Cause.interrupt())',
      value: CauseModule.combine(CauseModule.fail("boom"), CauseModule.interrupt()),
    },
    { label: "{ reasons: [] }", value: { reasons: [] } },
    {
      label: "{ [TypeId]: TypeId, reasons: [] }",
      value: { [CauseModule.TypeId]: CauseModule.TypeId, reasons: [] },
    },
  ];

  for (const candidate of candidates) {
    yield* Console.log(`isCause(${candidate.label}): ${CauseModule.isCause(candidate.value)}`);
  }
  yield* Console.log("Contract note: prefer Cause constructors over structural objects.");
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
      title: "Source-Aligned Guard Checks",
      description: "Run the documented Cause and non-Cause inputs to show true vs false behavior.",
      run: exampleSourceAlignedGuard,
    },
    {
      title: "Mixed Runtime Candidates",
      description: "Check real Cause constructors and structural lookalikes through the guard.",
      run: exampleMixedCandidates,
    },
  ],
});

BunRuntime.runMain(program);
