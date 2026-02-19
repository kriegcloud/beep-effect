/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: fibonacci
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * A schedule that always recurs, increasing delays by summing the preceding two delays (similar to the fibonacci sequence). Returns the current duration between recurrences.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Basic fibonacci schedule starting with 100ms
 * const fibSchedule = Schedule.fibonacci("100 millis")
 * // Delays: 100ms, 100ms, 200ms, 300ms, 500ms, 800ms, 1300ms, ...
 * 
 * // Retry with fibonacci backoff for gradual increase
 * const retryWithFib = Effect.gen(function*() {
 *   let attempt = 0
 * 
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 * 
 *       if (attempt < 5) {
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 * 
 *       return `Success on attempt ${attempt}`
 *     }),
 *     Schedule.fibonacci("50 millis").pipe(
 *       Schedule.compose(Schedule.recurs(6)), // Maximum 6 retries
 *       Schedule.tapOutput((delay) => Console.log(`Next retry in ${delay}`))
 *     )
 *   )
 * 
 *   yield* Console.log(`Final result: ${result}`)
 * })
 * 
 * // Heartbeat with fibonacci intervals (starts fast, gets slower)
 * const adaptiveHeartbeat = Effect.gen(function*() {
 *   yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)
 *   return "pulse"
 * }).pipe(
 *   Effect.repeat(
 *     Schedule.fibonacci("200 millis").pipe(
 *       Schedule.take(8) // First 8 heartbeats
 *     )
 *   )
 * )
 * 
 * // Fibonacci vs exponential comparison
 * const compareSchedules = Effect.gen(function*() {
 *   yield* Console.log("=== Fibonacci Delays ===")
 *   // 100ms, 100ms, 200ms, 300ms, 500ms, 800ms
 * 
 *   yield* Console.log("=== Exponential Delays ===")
 *   // 100ms, 200ms, 400ms, 800ms, 1600ms, 3200ms
 * 
 *   // Fibonacci grows more slowly than exponential
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
const exportName = "fibonacci";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "A schedule that always recurs, increasing delays by summing the preceding two delays (similar to the fibonacci sequence). Returns the current duration between recurrences.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Basic fibonacci schedule starting with 100ms\nconst fibSchedule = Schedule.fibonacci(\"100 millis\")\n// Delays: 100ms, 100ms, 200ms, 300ms, 500ms, 800ms, 1300ms, ...\n\n// Retry with fibonacci backoff for gradual increase\nconst retryWithFib = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Attempt ${attempt}`)\n\n      if (attempt < 5) {\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n\n      return `Success on attempt ${attempt}`\n    }),\n    Schedule.fibonacci(\"50 millis\").pipe(\n      Schedule.compose(Schedule.recurs(6)), // Maximum 6 retries\n      Schedule.tapOutput((delay) => Console.log(`Next retry in ${delay}`))\n    )\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})\n\n// Heartbeat with fibonacci intervals (starts fast, gets slower)\nconst adaptiveHeartbeat = Effect.gen(function*() {\n  yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)\n  return \"pulse\"\n}).pipe(\n  Effect.repeat(\n    Schedule.fibonacci(\"200 millis\").pipe(\n      Schedule.take(8) // First 8 heartbeats\n    )\n  )\n)\n\n// Fibonacci vs exponential comparison\nconst compareSchedules = Effect.gen(function*() {\n  yield* Console.log(\"=== Fibonacci Delays ===\")\n  // 100ms, 100ms, 200ms, 300ms, 500ms, 800ms\n\n  yield* Console.log(\"=== Exponential Delays ===\")\n  // 100ms, 200ms, 400ms, 800ms, 1600ms, 3200ms\n\n  // Fibonacci grows more slowly than exponential\n})";
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
