/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: windowed
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.053Z
 *
 * Overview:
 * A schedule that divides the timeline to `interval`-long windows, and sleeps until the nearest window boundary every time it recurs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Execute tasks at regular intervals aligned to window boundaries
 * const windowSchedule = Schedule.windowed("5 seconds")
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const now = new Date().toISOString()
 *       yield* Console.log(`Window task executed at: ${now}`)
 *       return "window-task"
 *     }),
 *     windowSchedule.pipe(Schedule.take(4))
 *   )
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ScheduleModule from "effect/Schedule";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "windowed";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "A schedule that divides the timeline to `interval`-long windows, and sleeps until the nearest window boundary every time it recurs.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Execute tasks at regular intervals aligned to window boundaries\nconst windowSchedule = Schedule.windowed(\"5 seconds\")\n\nconst program = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      const now = new Date().toISOString()\n      yield* Console.log(`Window task executed at: ${now}`)\n      return \"window-task\"\n    }),\n    windowSchedule.pipe(Schedule.take(4))\n  )\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
