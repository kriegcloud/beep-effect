/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: andThenResult
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.050Z
 *
 * Overview:
 * Returns a new `Schedule` that will first execute the left (i.e. `self`) schedule to completion. Once the left schedule is complete, the right (i.e. `other`) schedule will be executed to completion.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Result, Schedule } from "effect"
 *
 * // Track which phase of the schedule we're in
 * const phaseTracker = Schedule.andThenResult(
 *   Schedule.exponential("100 millis").pipe(Schedule.take(2)),
 *   Schedule.spaced("500 millis").pipe(Schedule.take(2))
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-result"
 *     }),
 *     phaseTracker.pipe(
 *       Schedule.tapOutput((result) =>
 *         Result.match(result, {
 *           onFailure: (phase1Output) => Console.log(`Phase 1: ${phase1Output}`),
 *           onSuccess: (phase2Output) => Console.log(`Phase 2: ${phase2Output}`)
 *         })
 *       )
 *     )
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "andThenResult";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a new `Schedule` that will first execute the left (i.e. `self`) schedule to completion. Once the left schedule is complete, the right (i.e. `other`) schedule will be exe...";
const sourceExample =
  'import { Console, Effect, Result, Schedule } from "effect"\n\n// Track which phase of the schedule we\'re in\nconst phaseTracker = Schedule.andThenResult(\n  Schedule.exponential("100 millis").pipe(Schedule.take(2)),\n  Schedule.spaced("500 millis").pipe(Schedule.take(2))\n)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Task executed")\n      return "task-result"\n    }),\n    phaseTracker.pipe(\n      Schedule.tapOutput((result) =>\n        Result.match(result, {\n          onFailure: (phase1Output) => Console.log(`Phase 1: ${phase1Output}`),\n          onSuccess: (phase2Output) => Console.log(`Phase 2: ${phase2Output}`)\n        })\n      )\n    )\n  )\n})';
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
  bunContext: BunContext,
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
