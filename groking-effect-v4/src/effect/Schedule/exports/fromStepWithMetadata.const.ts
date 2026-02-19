/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: fromStepWithMetadata
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Creates a Schedule from a step function that receives metadata about the schedule's execution.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Schedule } from "effect"
 * 
 * // fromStepWithMetadata is an advanced function for creating schedules
 * // that need access to execution metadata like timing and recurrence count
 * 
 * // Most users should use simpler metadata-aware functions like:
 * const metadataSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.collectWhile((metadata) => Effect.succeed(metadata.attempt <= 5))
 * )
 * 
 * // Or use existing schedules with metadata transformations:
 * const conditionalSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.tapOutput((output) => Effect.log(`Output: ${output}`))
 * )
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
const exportName = "fromStepWithMetadata";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Creates a Schedule from a step function that receives metadata about the schedule's execution.";
const sourceExample = "import { Effect, Schedule } from \"effect\"\n\n// fromStepWithMetadata is an advanced function for creating schedules\n// that need access to execution metadata like timing and recurrence count\n\n// Most users should use simpler metadata-aware functions like:\nconst metadataSchedule = Schedule.spaced(\"1 second\").pipe(\n  Schedule.collectWhile((metadata) => Effect.succeed(metadata.attempt <= 5))\n)\n\n// Or use existing schedules with metadata transformations:\nconst conditionalSchedule = Schedule.exponential(\"100 millis\").pipe(\n  Schedule.tapOutput((output) => Effect.log(`Output: ${output}`))\n)";
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
