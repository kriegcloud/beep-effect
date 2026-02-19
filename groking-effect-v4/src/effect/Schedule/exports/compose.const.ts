/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: compose
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.050Z
 *
 * Overview:
 * Returns a new `Schedule` that combines two schedules by running them sequentially. First the current schedule runs to completion, then the other schedule runs to completion. The output is a tuple of both results.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Compose a quick retry phase followed by slower retry phase
 * const fastRetries = Schedule.exponential("100 millis").pipe(
 *   Schedule.compose(Schedule.recurs(3)) // 3 fast retries
 * )
 * 
 * const slowRetries = Schedule.exponential("2 seconds").pipe(
 *   Schedule.compose(Schedule.recurs(2)) // 2 slow retries
 * )
 * 
 * // Sequential composition: fast retries first, then slow retries
 * const composedRetry = Schedule.compose(fastRetries, slowRetries)
 * // Outputs: [number_from_fast_phase, number_from_slow_phase]
 * 
 * const program = Effect.gen(function*() {
 *   let attempt = 0
 * 
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 * 
 *       if (attempt < 7) { // Needs both phases to succeed
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 * 
 *       return `Success on attempt ${attempt}`
 *     }),
 *     composedRetry.pipe(
 *       Schedule.tapOutput(([fastResult, slowResult]) =>
 *         Console.log(`Fast phase: ${fastResult}, Slow phase: ${slowResult}`)
 *       )
 *     )
 *   )
 * 
 *   yield* Console.log(`Final result: ${result}`)
 * })
 * 
 * // Compose different schedule types
 * const warmupAndMaintenance = Schedule.compose(
 *   Schedule.fixed("500 millis").pipe(Schedule.take(5)), // 5 warmup cycles
 *   Schedule.spaced("5 seconds") // then regular maintenance
 * )
 * 
 * // Progressive backoff: fixed first, then exponential
 * const progressiveBackoff = Schedule.compose(
 *   Schedule.fixed("100 millis").pipe(Schedule.take(3)), // Fixed: 100ms, 100ms, 100ms
 *   Schedule.exponential("500 millis").pipe(Schedule.take(3)) // Then exponential: 500ms, 1s, 2s
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
const exportName = "compose";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a new `Schedule` that combines two schedules by running them sequentially. First the current schedule runs to completion, then the other schedule runs to completion. The...";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Compose a quick retry phase followed by slower retry phase\nconst fastRetries = Schedule.exponential(\"100 millis\").pipe(\n  Schedule.compose(Schedule.recurs(3)) // 3 fast retries\n)\n\nconst slowRetries = Schedule.exponential(\"2 seconds\").pipe(\n  Schedule.compose(Schedule.recurs(2)) // 2 slow retries\n)\n\n// Sequential composition: fast retries first, then slow retries\nconst composedRetry = Schedule.compose(fastRetries, slowRetries)\n// Outputs: [number_from_fast_phase, number_from_slow_phase]\n\nconst program = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Attempt ${attempt}`)\n\n      if (attempt < 7) { // Needs both phases to succeed\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n\n      return `Success on attempt ${attempt}`\n    }),\n    composedRetry.pipe(\n      Schedule.tapOutput(([fastResult, slowResult]) =>\n        Console.log(`Fast phase: ${fastResult}, Slow phase: ${slowResult}`)\n      )\n    )\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})\n\n// Compose different schedule types\nconst warmupAndMaintenance = Schedule.compose(\n  Schedule.fixed(\"500 millis\").pipe(Schedule.take(5)), // 5 warmup cycles\n  Schedule.spaced(\"5 seconds\") // then regular maintenance\n)\n\n// Progressive backoff: fixed first, then exponential\nconst progressiveBackoff = Schedule.compose(\n  Schedule.fixed(\"100 millis\").pipe(Schedule.take(3)), // Fixed: 100ms, 100ms, 100ms\n  Schedule.exponential(\"500 millis\").pipe(Schedule.take(3)) // Then exponential: 500ms, 1s, 2s\n)";
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
