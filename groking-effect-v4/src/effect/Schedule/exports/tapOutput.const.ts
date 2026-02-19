/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: tapOutput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.053Z
 *
 * Overview:
 * Returns a new `Schedule` that allows execution of an effectful function for every output of the schedule, but does not alter the inputs and outputs of the schedule.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Log schedule outputs for debugging/monitoring
 * const monitoredSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(5),
 *   Schedule.tapOutput((delay) => Console.log(`Next delay will be: ${delay}`))
 * )
 * 
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 * 
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       if (attempt < 4) {
 *         yield* Effect.fail(new Error(`Attempt ${attempt} failed`))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     monitoredSchedule
 *   )
 * 
 *   yield* Console.log(`Final result: ${result}`)
 * })
 * 
 * // Tap output for metrics collection
 * const metricsSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.take(10),
 *   Schedule.tapOutput((executionCount) =>
 *     Effect.gen(function*() {
 *       // Simulate metrics collection
 *       yield* Console.log(`Recording metric: execution_count=${executionCount}`)
 *       // In real code, this might send to monitoring system
 *     })
 *   )
 * )
 * 
 * // Tap output with conditional side effects
 * const alertingSchedule = Schedule.fibonacci("200 millis").pipe(
 *   Schedule.take(8),
 *   Schedule.tapOutput((delay) =>
 *     Effect.gen(function*() {
 *       const delayMs = delay.toString()
 *       if (delayMs.includes("1000")) { // Alert on delays >= 1 second
 *         yield* Console.log(`🚨 High delay detected: ${delay}`)
 *       }
 *     })
 *   )
 * )
 * 
 * const healthCheckProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Performing health check...")
 *       // Simulate health check
 *       return Math.random() > 0.7 ? "healthy" : "degraded"
 *     }),
 *     alertingSchedule
 *   )
 * })
 * 
 * // Chain multiple taps for different purposes
 * const comprehensiveSchedule = Schedule.fixed("500 millis").pipe(
 *   Schedule.take(6),
 *   Schedule.tapOutput((count) => Console.log(`Execution ${count + 1}`)),
 *   Schedule.tapOutput((count) =>
 *     count % 3 === 0
 *       ? Console.log("🎯 Checkpoint reached!")
 *       : Effect.void
 *   )
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
const exportName = "tapOutput";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a new `Schedule` that allows execution of an effectful function for every output of the schedule, but does not alter the inputs and outputs of the schedule.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Log schedule outputs for debugging/monitoring\nconst monitoredSchedule = Schedule.exponential(\"100 millis\").pipe(\n  Schedule.take(5),\n  Schedule.tapOutput((delay) => Console.log(`Next delay will be: ${delay}`))\n)\n\nconst retryProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      if (attempt < 4) {\n        yield* Effect.fail(new Error(`Attempt ${attempt} failed`))\n      }\n      return `Success on attempt ${attempt}`\n    }),\n    monitoredSchedule\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})\n\n// Tap output for metrics collection\nconst metricsSchedule = Schedule.spaced(\"1 second\").pipe(\n  Schedule.take(10),\n  Schedule.tapOutput((executionCount) =>\n    Effect.gen(function*() {\n      // Simulate metrics collection\n      yield* Console.log(`Recording metric: execution_count=${executionCount}`)\n      // In real code, this might send to monitoring system\n    })\n  )\n)\n\n// Tap output with conditional side effects\nconst alertingSchedule = Schedule.fibonacci(\"200 millis\").pipe(\n  Schedule.take(8),\n  Schedule.tapOutput((delay) =>\n    Effect.gen(function*() {\n      const delayMs = delay.toString()\n      if (delayMs.includes(\"1000\")) { // Alert on delays >= 1 second\n        yield* Console.log(`🚨 High delay detected: ${delay}`)\n      }\n    })\n  )\n)\n\nconst healthCheckProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Performing health check...\")\n      // Simulate health check\n      return Math.random() > 0.7 ? \"healthy\" : \"degraded\"\n    }),\n    alertingSchedule\n  )\n})\n\n// Chain multiple taps for different purposes\nconst comprehensiveSchedule = Schedule.fixed(\"500 millis\").pipe(\n  Schedule.take(6),\n  Schedule.tapOutput((count) => Console.log(`Execution ${count + 1}`)),\n  Schedule.tapOutput((count) =>\n    count % 3 === 0\n      ? Console.log(\"🎯 Checkpoint reached!\")\n      : Effect.void\n  )\n)";
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
