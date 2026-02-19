/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: elapsed
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * A schedule that always recurs and returns the total elapsed duration since the first recurrence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Duration, Effect, Schedule } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Console.log("Running task..."),
 *     Schedule.spaced("1 second").pipe(
 *       Schedule.both(Schedule.elapsed),
 *       Schedule.tapOutput(([count, duration]) =>
 *         Console.log(`Run ${count}, elapsed: ${Duration.toMillis(duration)}ms`)
 *       ),
 *       Schedule.take(5)
 *     )
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
const exportName = "elapsed";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "A schedule that always recurs and returns the total elapsed duration since the first recurrence.";
const sourceExample = "import { Console, Duration, Effect, Schedule } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Console.log(\"Running task...\"),\n    Schedule.spaced(\"1 second\").pipe(\n      Schedule.both(Schedule.elapsed),\n      Schedule.tapOutput(([count, duration]) =>\n        Console.log(`Run ${count}, elapsed: ${Duration.toMillis(duration)}ms`)\n      ),\n      Schedule.take(5)\n    )\n  )\n})";
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
