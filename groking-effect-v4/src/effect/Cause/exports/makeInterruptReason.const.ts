/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: makeInterruptReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Creates a standalone {@link Interrupt} reason (not wrapped in a {@link Cause}), optionally carrying the interrupting fiber's ID.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.makeInterruptReason(42)
 * console.log(reason._tag) // "Interrupt"
 * console.log(reason.fiberId) // 42
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
const exportName = "makeInterruptReason";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Creates a standalone {@link Interrupt} reason (not wrapped in a {@link Cause}), optionally carrying the interrupting fiber's ID.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst reason = Cause.makeInterruptReason(42)\nconsole.log(reason._tag) // "Interrupt"\nconsole.log(reason.fiberId) // 42';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect makeInterruptReason as a callable reason constructor.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInterruptReason = Effect.gen(function* () {
  const reason = CauseModule.makeInterruptReason(42);

  yield* Console.log(`reason _tag: ${reason._tag}`);
  yield* Console.log(`reason fiberId: ${String(reason.fiberId)}`);
  yield* Console.log(`isInterruptReason(reason): ${CauseModule.isInterruptReason(reason)}`);
});

const exampleStandaloneReasonUsage = Effect.gen(function* () {
  const reasonWithId = CauseModule.makeInterruptReason(7);
  const causeFromReason = CauseModule.fromReasons([reasonWithId]);
  const reasonWithoutId = CauseModule.makeInterruptReason();

  yield* Console.log(`fromReasons([reason]) -> reasons.length: ${causeFromReason.reasons.length}`);
  yield* Console.log(`hasInterruptsOnly(fromReasons): ${CauseModule.hasInterruptsOnly(causeFromReason)}`);
  yield* Console.log(`without explicit id -> fiberId: ${String(reasonWithoutId.fiberId)}`);
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
      title: "Source-Aligned Interrupt Reason",
      description: "Create an Interrupt reason with fiber id 42 and verify its runtime fields.",
      run: exampleSourceAlignedInterruptReason,
    },
    {
      title: "Standalone Reason Usage",
      description: "Use makeInterruptReason output with fromReasons and compare missing fiber id behavior.",
      run: exampleStandaloneReasonUsage,
    },
  ],
});

BunRuntime.runMain(program);
