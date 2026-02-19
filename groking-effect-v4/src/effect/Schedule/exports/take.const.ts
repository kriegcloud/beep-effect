/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: take
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.053Z
 *
 * Overview:
 * Returns a new `Schedule` that takes at most the specified number of outputs from the schedule. Once the specified number of outputs is reached, the schedule will stop.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Limit an infinite schedule to run only 5 times
 * const limitedHeartbeat = Schedule.spaced("1 second").pipe(
 *   Schedule.take(5) // Will stop after 5 executions
 * )
 * 
 * const heartbeatProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)
 *       return "pulse"
 *     }),
 *     limitedHeartbeat
 *   )
 * 
 *   yield* Console.log("Heartbeat sequence completed")
 * })
 * 
 * // Limit retry attempts to a specific number
 * const limitedRetry = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(3) // At most 3 retry attempts
 * )
 * 
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 * 
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 * 
 *       if (attempt < 5) { // Will fail more than 3 times
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 * 
 *       return `Success on attempt ${attempt}`
 *     }),
 *     limitedRetry
 *   )
 * 
 *   yield* Console.log(`Result: ${result}`)
 * }).pipe(
 *   Effect.catch((error: unknown) =>
 *     Console.log(`Failed after limited retries: ${String(error)}`)
 *   )
 * )
 * 
 * // Combine take with other schedule operations
 * const samplingSchedule = Schedule.fixed("500 millis").pipe(
 *   Schedule.take(10), // Sample exactly 10 times
 *   Schedule.map((count) => Effect.succeed(`Sample #${count + 1}`))
 * )
 * 
 * const samplingProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const value = Math.random()
 *       yield* Console.log(`Sampled value: ${value.toFixed(3)}`)
 *       return value
 *     }),
 *     samplingSchedule.pipe(
 *       Schedule.tapOutput((label) => Console.log(`Completed: ${label}`))
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
const exportName = "take";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a new `Schedule` that takes at most the specified number of outputs from the schedule. Once the specified number of outputs is reached, the schedule will stop.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Limit an infinite schedule to run only 5 times\nconst limitedHeartbeat = Schedule.spaced(\"1 second\").pipe(\n  Schedule.take(5) // Will stop after 5 executions\n)\n\nconst heartbeatProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)\n      return \"pulse\"\n    }),\n    limitedHeartbeat\n  )\n\n  yield* Console.log(\"Heartbeat sequence completed\")\n})\n\n// Limit retry attempts to a specific number\nconst limitedRetry = Schedule.exponential(\"100 millis\").pipe(\n  Schedule.take(3) // At most 3 retry attempts\n)\n\nconst retryProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Attempt ${attempt}`)\n\n      if (attempt < 5) { // Will fail more than 3 times\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n\n      return `Success on attempt ${attempt}`\n    }),\n    limitedRetry\n  )\n\n  yield* Console.log(`Result: ${result}`)\n}).pipe(\n  Effect.catch((error: unknown) =>\n    Console.log(`Failed after limited retries: ${String(error)}`)\n  )\n)\n\n// Combine take with other schedule operations\nconst samplingSchedule = Schedule.fixed(\"500 millis\").pipe(\n  Schedule.take(10), // Sample exactly 10 times\n  Schedule.map((count) => Effect.succeed(`Sample #${count + 1}`))\n)\n\nconst samplingProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      const value = Math.random()\n      yield* Console.log(`Sampled value: ${value.toFixed(3)}`)\n      return value\n    }),\n    samplingSchedule.pipe(\n      Schedule.tapOutput((label) => Console.log(`Completed: ${label}`))\n    )\n  )\n})";
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
