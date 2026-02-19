/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: InputMetadata
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Metadata provided to schedule functions containing timing and input information.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Custom schedule that uses input metadata
 * const metadataAwareSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.collectWhile((metadata) =>
 *     Effect.succeed(metadata.attempt <= 5 && metadata.elapsed < 10000)
 *   )
 * )
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Console.log("Task execution"),
 *     metadataAwareSchedule
 *   )
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ScheduleModule from "effect/Schedule";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "InputMetadata";
const exportKind = "interface";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Metadata provided to schedule functions containing timing and input information.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Custom schedule that uses input metadata\nconst metadataAwareSchedule = Schedule.spaced(\"1 second\").pipe(\n  Schedule.collectWhile((metadata) =>\n    Effect.succeed(metadata.attempt <= 5 && metadata.elapsed < 10000)\n  )\n)\n\nconst program = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Console.log(\"Task execution\"),\n    metadataAwareSchedule\n  )\n})";
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
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
