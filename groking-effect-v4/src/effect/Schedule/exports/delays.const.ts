/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: delays
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * Returns a new schedule that outputs the delay between each occurence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Extract delays from an exponential backoff schedule
 * const exponentialDelays = Schedule.delays(
 *   Schedule.exponential("100 millis").pipe(Schedule.take(5))
 * )
 * 
 * const delayProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task result"
 *     }),
 *     exponentialDelays.pipe(
 *       Schedule.tapOutput((delay) =>
 *         Console.log(`Waiting ${delay} before next execution`)
 *       )
 *     )
 *   )
 * })
 * 
 * // Monitor delays from a fibonacci schedule
 * const fibonacciDelays = Schedule.delays(
 *   Schedule.fibonacci("200 millis").pipe(Schedule.take(8))
 * )
 * 
 * const fibDelayProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Console.log("Fibonacci task"),
 *     fibonacciDelays.pipe(
 *       Schedule.tapOutput((delay) => Console.log(`Fibonacci delay: ${delay}`))
 *     )
 *   )
 * })
 * 
 * // Extract delays for analysis or logging
 * const analyzeDelays = Schedule.delays(
 *   Schedule.spaced("1 second").pipe(Schedule.take(3))
 * ).pipe(
 *   Schedule.tapOutput((delay) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Recorded delay: ${delay}`)
 *       // In real applications, might send to metrics system
 *     })
 *   )
 * )
 * 
 * // Combine delays with other schedules for complex timing
 * const adaptiveSchedule = Schedule.unfold(100, (delay) => Effect.succeed(delay * 1.5)).pipe(
 *   Schedule.take(6)
 * )
 * 
 * const adaptiveDelays = Schedule.delays(adaptiveSchedule)
 * 
 * const adaptiveProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Adaptive task execution")
 *       return Date.now()
 *     }),
 *     adaptiveDelays.pipe(
 *       Schedule.tapOutput((delay) => Console.log(`Adaptive delay: ${delay}`))
 *     )
 *   )
 * })
 * 
 * // Use delays to implement custom timing logic
 * const customTimingSchedule = Schedule.delays(
 *   Schedule.exponential("50 millis").pipe(Schedule.take(4))
 * ).pipe(
 *   Schedule.map((delay) => Effect.succeed(`Next execution in ${delay}`)),
 *   Schedule.tapOutput((message) => Console.log(message))
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
const exportName = "delays";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a new schedule that outputs the delay between each occurence.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Extract delays from an exponential backoff schedule\nconst exponentialDelays = Schedule.delays(\n  Schedule.exponential(\"100 millis\").pipe(Schedule.take(5))\n)\n\nconst delayProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Task executed\")\n      return \"task result\"\n    }),\n    exponentialDelays.pipe(\n      Schedule.tapOutput((delay) =>\n        Console.log(`Waiting ${delay} before next execution`)\n      )\n    )\n  )\n})\n\n// Monitor delays from a fibonacci schedule\nconst fibonacciDelays = Schedule.delays(\n  Schedule.fibonacci(\"200 millis\").pipe(Schedule.take(8))\n)\n\nconst fibDelayProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Console.log(\"Fibonacci task\"),\n    fibonacciDelays.pipe(\n      Schedule.tapOutput((delay) => Console.log(`Fibonacci delay: ${delay}`))\n    )\n  )\n})\n\n// Extract delays for analysis or logging\nconst analyzeDelays = Schedule.delays(\n  Schedule.spaced(\"1 second\").pipe(Schedule.take(3))\n).pipe(\n  Schedule.tapOutput((delay) =>\n    Effect.gen(function*() {\n      yield* Console.log(`Recorded delay: ${delay}`)\n      // In real applications, might send to metrics system\n    })\n  )\n)\n\n// Combine delays with other schedules for complex timing\nconst adaptiveSchedule = Schedule.unfold(100, (delay) => Effect.succeed(delay * 1.5)).pipe(\n  Schedule.take(6)\n)\n\nconst adaptiveDelays = Schedule.delays(adaptiveSchedule)\n\nconst adaptiveProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Adaptive task execution\")\n      return Date.now()\n    }),\n    adaptiveDelays.pipe(\n      Schedule.tapOutput((delay) => Console.log(`Adaptive delay: ${delay}`))\n    )\n  )\n})\n\n// Use delays to implement custom timing logic\nconst customTimingSchedule = Schedule.delays(\n  Schedule.exponential(\"50 millis\").pipe(Schedule.take(4))\n).pipe(\n  Schedule.map((delay) => Effect.succeed(`Next execution in ${delay}`)),\n  Schedule.tapOutput((message) => Console.log(message))\n)";
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
