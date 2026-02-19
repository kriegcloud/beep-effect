/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: tapInput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:50:39.069Z
 *
 * Overview:
 * Returns a new `Schedule` that allows execution of an effectful function for every input to the schedule, but does not alter the inputs and outputs of the schedule.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Log retry errors for debugging
 * const errorLoggingSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(3),
 *   Schedule.tapInput((error: Error) =>
 *     Console.log(`Retry triggered by error: ${String(error)}`)
 *   )
 * )
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       if (attempt < 4) {
 *         yield* Effect.fail(new Error(`Network timeout on attempt ${attempt}`))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     errorLoggingSchedule
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Monitor input frequency for metrics
 * const inputMonitoringSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.take(5),
 *   Schedule.tapInput((input: unknown) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Processing input at ${new Date().toISOString()}`)
 *       yield* Console.log(`Input type: ${typeof input}`)
 *       // In real applications, might send metrics to monitoring system
 *     })
 *   )
 * )
 *
 * // Input validation with side effects
 * const validatingSchedule = Schedule.fixed("500 millis").pipe(
 *   Schedule.take(4),
 *   Schedule.tapInput((input: any) =>
 *     Effect.gen(function*() {
 *       if (typeof input === "object" && input !== null) {
 *         yield* Console.log(`Valid object input: ${JSON.stringify(input)}`)
 *       } else {
 *         yield* Console.log(`Warning: Non-object input received: ${input}`)
 *       }
 *     })
 *   )
 * )
 *
 * const validationProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task with validation")
 *       return { data: Math.random(), timestamp: Date.now() }
 *     }),
 *     validatingSchedule
 *   )
 * })
 *
 * // Conditional alerting based on input
 * const alertingSchedule = Schedule.exponential("200 millis").pipe(
 *   Schedule.take(6),
 *   Schedule.tapInput((error: Error) =>
 *     Effect.gen(function*() {
 *       if (String(error).includes("critical")) {
 *         yield* Console.log(`🚨 CRITICAL ERROR: ${String(error)}`)
 *         // In real applications, might trigger alerts or notifications
 *       } else {
 *         yield* Console.log(`ℹ️ Regular error: ${String(error)}`)
 *       }
 *     })
 *   )
 * )
 *
 * const alertProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       const isCritical = attempt === 3
 *       const errorType = isCritical
 *         ? "critical database failure"
 *         : "temporary network issue"
 *       yield* Effect.fail(new Error(errorType))
 *     }),
 *     alertingSchedule
 *   ).pipe(
 *     Effect.catch((error: unknown) =>
 *       Console.log(`All retries exhausted: ${String(error)}`)
 *     )
 *   )
 * })
 *
 * // Chain multiple input taps for different purposes
 * const comprehensiveSchedule = Schedule.fibonacci("100 millis").pipe(
 *   Schedule.take(5),
 *   Schedule.tapInput((error: Error) =>
 *     Console.log(`Error occurred: ${error.name}`)
 *   ),
 *   Schedule.tapInput((error: Error) =>
 *     String(error).length > 20
 *       ? Console.log("📝 Long error message detected")
 *       : Effect.void
 *   )
 * )
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "tapInput";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a new `Schedule` that allows execution of an effectful function for every input to the schedule, but does not alter the inputs and outputs of the schedule.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Log retry errors for debugging\nconst errorLoggingSchedule = Schedule.exponential("100 millis").pipe(\n  Schedule.take(3),\n  Schedule.tapInput((error: Error) =>\n    Console.log(`Retry triggered by error: ${String(error)}`)\n  )\n)\n\nconst retryProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      if (attempt < 4) {\n        yield* Effect.fail(new Error(`Network timeout on attempt ${attempt}`))\n      }\n      return `Success on attempt ${attempt}`\n    }),\n    errorLoggingSchedule\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})\n\n// Monitor input frequency for metrics\nconst inputMonitoringSchedule = Schedule.spaced("1 second").pipe(\n  Schedule.take(5),\n  Schedule.tapInput((input: unknown) =>\n    Effect.gen(function*() {\n      yield* Console.log(`Processing input at ${new Date().toISOString()}`)\n      yield* Console.log(`Input type: ${typeof input}`)\n      // In real applications, might send metrics to monitoring system\n    })\n  )\n)\n\n// Input validation with side effects\nconst validatingSchedule = Schedule.fixed("500 millis").pipe(\n  Schedule.take(4),\n  Schedule.tapInput((input: any) =>\n    Effect.gen(function*() {\n      if (typeof input === "object" && input !== null) {\n        yield* Console.log(`Valid object input: ${JSON.stringify(input)}`)\n      } else {\n        yield* Console.log(`Warning: Non-object input received: ${input}`)\n      }\n    })\n  )\n)\n\nconst validationProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Task with validation")\n      return { data: Math.random(), timestamp: Date.now() }\n    }),\n    validatingSchedule\n  )\n})\n\n// Conditional alerting based on input\nconst alertingSchedule = Schedule.exponential("200 millis").pipe(\n  Schedule.take(6),\n  Schedule.tapInput((error: Error) =>\n    Effect.gen(function*() {\n      if (String(error).includes("critical")) {\n        yield* Console.log(`🚨 CRITICAL ERROR: ${String(error)}`)\n        // In real applications, might trigger alerts or notifications\n      } else {\n        yield* Console.log(`ℹ️ Regular error: ${String(error)}`)\n      }\n    })\n  )\n)\n\nconst alertProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      const isCritical = attempt === 3\n      const errorType = isCritical\n        ? "critical database failure"\n        : "temporary network issue"\n      yield* Effect.fail(new Error(errorType))\n    }),\n    alertingSchedule\n  ).pipe(\n    Effect.catch((error: unknown) =>\n      Console.log(`All retries exhausted: ${String(error)}`)\n    )\n  )\n})\n\n// Chain multiple input taps for different purposes\nconst comprehensiveSchedule = Schedule.fibonacci("100 millis").pipe(\n  Schedule.take(5),\n  Schedule.tapInput((error: Error) =>\n    Console.log(`Error occurred: ${error.name}`)\n  ),\n  Schedule.tapInput((error: Error) =>\n    String(error).length > 20\n      ? Console.log("📝 Long error message detected")\n      : Effect.void\n  )\n)';
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
