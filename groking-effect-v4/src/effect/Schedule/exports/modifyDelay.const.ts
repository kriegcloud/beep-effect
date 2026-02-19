/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: modifyDelay
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:50:39.068Z
 *
 * Overview:
 * Returns a new `Schedule` that modifies the delay of the next recurrence of the schedule using the specified effectual function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Duration, Effect, Schedule } from "effect"
 *
 * // Modify delays based on output - increase delay on high iteration counts
 * const adaptiveDelay = Schedule.recurs(10).pipe(
 *   Schedule.modifyDelay((output, delay) => {
 *     // Double the delay if we're seeing high iteration counts
 *     return Effect.succeed(output > 5 ? Duration.times(delay, 2) : delay)
 *   })
 * )
 *
 * const program = Effect.gen(function*() {
 *   let counter = 0
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       counter++
 *       yield* Console.log(`Attempt ${counter}`)
 *       return counter
 *     }),
 *     adaptiveDelay.pipe(Schedule.take(8))
 *   )
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
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "modifyDelay";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a new `Schedule` that modifies the delay of the next recurrence of the schedule using the specified effectual function.";
const sourceExample =
  'import { Console, Duration, Effect, Schedule } from "effect"\n\n// Modify delays based on output - increase delay on high iteration counts\nconst adaptiveDelay = Schedule.recurs(10).pipe(\n  Schedule.modifyDelay((output, delay) => {\n    // Double the delay if we\'re seeing high iteration counts\n    return Effect.succeed(output > 5 ? Duration.times(delay, 2) : delay)\n  })\n)\n\nconst program = Effect.gen(function*() {\n  let counter = 0\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      counter++\n      yield* Console.log(`Attempt ${counter}`)\n      return counter\n    }),\n    adaptiveDelay.pipe(Schedule.take(8))\n  )\n})';
const moduleRecord = ScheduleModule as Record<string, unknown>;

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
