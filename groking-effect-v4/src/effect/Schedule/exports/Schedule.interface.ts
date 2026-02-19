/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: Schedule
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * A Schedule defines a strategy for repeating or retrying effects based on some policy.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Basic retry schedule - retry up to 3 times with exponential backoff
 * const retrySchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.compose(Schedule.recurs(3))
 * )
 *
 * // Basic repeat schedule - repeat every 30 seconds forever
 * const repeatSchedule: Schedule.Schedule<number, unknown, never> = Schedule
 *   .spaced("30 seconds")
 *
 * // Advanced schedule with custom logic
 * const smartRetry = Schedule.exponential("1 second")
 *
 * const program = Effect.gen(function*() {
 *   // Using retry schedule
 *   const result1 = yield* Effect.retry(
 *     Effect.fail("temporary error"),
 *     retrySchedule
 *   )
 *
 *   // Using repeat schedule
 *   yield* Console.log("heartbeat").pipe(
 *     Effect.repeat(repeatSchedule.pipe(Schedule.take(5)))
 *   )
 * })
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Schedule";
const exportKind = "interface";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "A Schedule defines a strategy for repeating or retrying effects based on some policy.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Basic retry schedule - retry up to 3 times with exponential backoff\nconst retrySchedule = Schedule.exponential("100 millis").pipe(\n  Schedule.compose(Schedule.recurs(3))\n)\n\n// Basic repeat schedule - repeat every 30 seconds forever\nconst repeatSchedule: Schedule.Schedule<number, unknown, never> = Schedule\n  .spaced("30 seconds")\n\n// Advanced schedule with custom logic\nconst smartRetry = Schedule.exponential("1 second")\n\nconst program = Effect.gen(function*() {\n  // Using retry schedule\n  const result1 = yield* Effect.retry(\n    Effect.fail("temporary error"),\n    retrySchedule\n  )\n\n  // Using repeat schedule\n  yield* Console.log("heartbeat").pipe(\n    Effect.repeat(repeatSchedule.pipe(Schedule.take(5)))\n  )\n})';
const moduleRecord = ScheduleModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
