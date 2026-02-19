/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestClock
 * Export: withLive
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestClock.ts
 * Generated: 2026-02-19T04:50:43.267Z
 *
 * Overview:
 * Executes the specified effect with the live `Clock` instead of the `TestClock`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Clock, Effect } from "effect"
 * import { TestClock } from "effect/testing"
 *
 * const program = Effect.gen(function*() {
 *   // Get the current test time (starts at epoch)
 *   const testTime = yield* Clock.currentTimeMillis
 *   console.log(testTime) // 0
 *
 *   // Get the actual system time using withLive
 *   const realTime = yield* TestClock.withLive(Clock.currentTimeMillis)
 *   console.log(realTime) // Actual system timestamp
 *
 *   // Advance test time
 *   yield* TestClock.adjust("1 hour")
 *
 *   // Test time is now 1 hour ahead
 *   const newTestTime = yield* Clock.currentTimeMillis
 *   console.log(newTestTime) // 3600000 (1 hour in milliseconds)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TestClockModule from "effect/testing/TestClock";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withLive";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestClock";
const sourceSummary = "Executes the specified effect with the live `Clock` instead of the `TestClock`.";
const sourceExample =
  'import { Clock, Effect } from "effect"\nimport { TestClock } from "effect/testing"\n\nconst program = Effect.gen(function*() {\n  // Get the current test time (starts at epoch)\n  const testTime = yield* Clock.currentTimeMillis\n  console.log(testTime) // 0\n\n  // Get the actual system time using withLive\n  const realTime = yield* TestClock.withLive(Clock.currentTimeMillis)\n  console.log(realTime) // Actual system timestamp\n\n  // Advance test time\n  yield* TestClock.adjust("1 hour")\n\n  // Test time is now 1 hour ahead\n  const newTestTime = yield* Clock.currentTimeMillis\n  console.log(newTestTime) // 3600000 (1 hour in milliseconds)\n})';
const moduleRecord = TestClockModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
