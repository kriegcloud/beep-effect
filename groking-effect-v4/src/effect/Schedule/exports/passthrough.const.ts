/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: passthrough
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Returns a new `Schedule` that outputs the inputs of the specified schedule.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Create a schedule that outputs the inputs instead of original outputs
 * const inputSchedule = Schedule.passthrough(
 *   Schedule.exponential("100 millis").pipe(Schedule.take(3))
 * )
 * 
 * const program = Effect.gen(function*() {
 *   let counter = 0
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       counter++
 *       yield* Console.log(`Task ${counter} executed`)
 *       return `result-${counter}`
 *     }),
 *     inputSchedule
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
const exportName = "passthrough";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a new `Schedule` that outputs the inputs of the specified schedule.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Create a schedule that outputs the inputs instead of original outputs\nconst inputSchedule = Schedule.passthrough(\n  Schedule.exponential(\"100 millis\").pipe(Schedule.take(3))\n)\n\nconst program = Effect.gen(function*() {\n  let counter = 0\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      counter++\n      yield* Console.log(`Task ${counter} executed`)\n      return `result-${counter}`\n    }),\n    inputSchedule\n  )\n})";
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
