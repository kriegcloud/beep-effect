/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: Metadata
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Extended metadata that includes both input metadata and the output value from the schedule.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Duration, Effect, Schedule } from "effect"
 *
 * // Custom schedule that logs metadata including output
 * const loggingSchedule = Schedule.unfold(0, (n) => Effect.succeed(n + 1)).pipe(
 *   Schedule.addDelay(() => Effect.succeed(Duration.millis(100))),
 *   Schedule.tapOutput((output) => {
 *     return Console.log(
 *       `Output: ${output}`
 *     )
 *   })
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.succeed("task completed"),
 *     loggingSchedule.pipe(Schedule.take(3))
 *   )
 * })
 *
 * // Output logs will show:
 * // "Output: 0, Attempt: 1, Elapsed: 0ms, Since previous: 0ms"
 * // "Output: 1, Attempt: 2, Elapsed: 100ms, Since previous: 100ms"
 * // "Output: 2, Attempt: 3, Elapsed: 200ms, Since previous: 100ms"
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
const exportName = "Metadata";
const exportKind = "interface";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Extended metadata that includes both input metadata and the output value from the schedule.";
const sourceExample =
  'import { Console, Duration, Effect, Schedule } from "effect"\n\n// Custom schedule that logs metadata including output\nconst loggingSchedule = Schedule.unfold(0, (n) => Effect.succeed(n + 1)).pipe(\n  Schedule.addDelay(() => Effect.succeed(Duration.millis(100))),\n  Schedule.tapOutput((output) => {\n    return Console.log(\n      `Output: ${output}`\n    )\n  })\n)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.succeed("task completed"),\n    loggingSchedule.pipe(Schedule.take(3))\n  )\n})\n\n// Output logs will show:\n// "Output: 0, Attempt: 1, Elapsed: 0ms, Since previous: 0ms"\n// "Output: 1, Attempt: 2, Elapsed: 100ms, Since previous: 100ms"\n// "Output: 2, Attempt: 3, Elapsed: 200ms, Since previous: 100ms"';
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
