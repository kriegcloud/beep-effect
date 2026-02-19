/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: unfold
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.053Z
 *
 * Overview:
 * Creates a schedule that unfolds a state by repeatedly applying a function, outputting the current state and computing the next state.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Counter schedule that increments by 1 each time
 * const counterSchedule = Schedule.unfold(0, (n) => Effect.succeed(n + 1))
 * // Outputs: 0, 1, 2, 3, 4, 5, ...
 *
 * const countingProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "done"
 *     }),
 *     counterSchedule.pipe(
 *       Schedule.take(5),
 *       Schedule.tapOutput((count) => Console.log(`Count: ${count}`))
 *     )
 *   )
 * })
 *
 * // Fibonacci sequence schedule
 * const fibonacciSchedule = Schedule.unfold(
 *   [0, 1] as [number, number],
 *   ([a, b]) => Effect.succeed([b, a + b] as [number, number])
 * )
 * // Outputs: [0,1], [1,1], [1,2], [2,3], [3,5], [5,8], ...
 *
 * const fibProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Console.log("Fibonacci step"),
 *     fibonacciSchedule.pipe(
 *       Schedule.take(8),
 *       Schedule.tapOutput(([a, b]) => Console.log(`Fib: ${a}, next: ${b}`))
 *     )
 *   )
 * })
 *
 * // Effectful unfold - exponential backoff with state
 * const exponentialState = Schedule.unfold(
 *   100,
 *   (delayMs) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Current delay: ${delayMs}ms`)
 *       return Math.min(delayMs * 2, 5000) // Cap at 5 seconds
 *     })
 * )
 *
 * // Random jitter schedule
 * const jitteredSchedule = Schedule.unfold(
 *   1000,
 *   (baseDelay) =>
 *     Effect.gen(function*() {
 *       const jitter = Math.random() * 200 - 100 // ±100ms jitter
 *       const nextDelay = Math.max(100, baseDelay + jitter)
 *       yield* Console.log(`Jittered delay: ${nextDelay.toFixed(0)}ms`)
 *       return nextDelay
 *     })
 * )
 *
 * // State machine schedule
 * type State = "init" | "warming" | "active" | "cooling"
 * const stateMachineSchedule = Schedule.unfold("init" as State, (state) => {
 *   switch (state) {
 *     case "init":
 *       return Effect.succeed("warming" as State)
 *     case "warming":
 *       return Effect.succeed("active" as State)
 *     case "active":
 *       return Effect.succeed("cooling" as State)
 *     case "cooling":
 *       return Effect.succeed("active" as State)
 *   }
 * })
 *
 * const stateMachineProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("State machine step")
 *       return "step"
 *     }),
 *     stateMachineSchedule.pipe(
 *       Schedule.take(10),
 *       Schedule.tapOutput((state) => Console.log(`State: ${state}`))
 *     )
 *   )
 * })
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "unfold";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Creates a schedule that unfolds a state by repeatedly applying a function, outputting the current state and computing the next state.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// Counter schedule that increments by 1 each time\nconst counterSchedule = Schedule.unfold(0, (n) => Effect.succeed(n + 1))\n// Outputs: 0, 1, 2, 3, 4, 5, ...\n\nconst countingProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("Task executed")\n      return "done"\n    }),\n    counterSchedule.pipe(\n      Schedule.take(5),\n      Schedule.tapOutput((count) => Console.log(`Count: ${count}`))\n    )\n  )\n})\n\n// Fibonacci sequence schedule\nconst fibonacciSchedule = Schedule.unfold(\n  [0, 1] as [number, number],\n  ([a, b]) => Effect.succeed([b, a + b] as [number, number])\n)\n// Outputs: [0,1], [1,1], [1,2], [2,3], [3,5], [5,8], ...\n\nconst fibProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Console.log("Fibonacci step"),\n    fibonacciSchedule.pipe(\n      Schedule.take(8),\n      Schedule.tapOutput(([a, b]) => Console.log(`Fib: ${a}, next: ${b}`))\n    )\n  )\n})\n\n// Effectful unfold - exponential backoff with state\nconst exponentialState = Schedule.unfold(\n  100,\n  (delayMs) =>\n    Effect.gen(function*() {\n      yield* Console.log(`Current delay: ${delayMs}ms`)\n      return Math.min(delayMs * 2, 5000) // Cap at 5 seconds\n    })\n)\n\n// Random jitter schedule\nconst jitteredSchedule = Schedule.unfold(\n  1000,\n  (baseDelay) =>\n    Effect.gen(function*() {\n      const jitter = Math.random() * 200 - 100 // ±100ms jitter\n      const nextDelay = Math.max(100, baseDelay + jitter)\n      yield* Console.log(`Jittered delay: ${nextDelay.toFixed(0)}ms`)\n      return nextDelay\n    })\n)\n\n// State machine schedule\ntype State = "init" | "warming" | "active" | "cooling"\nconst stateMachineSchedule = Schedule.unfold("init" as State, (state) => {\n  switch (state) {\n    case "init":\n      return Effect.succeed("warming" as State)\n    case "warming":\n      return Effect.succeed("active" as State)\n    case "active":\n      return Effect.succeed("cooling" as State)\n    case "cooling":\n      return Effect.succeed("active" as State)\n  }\n})\n\nconst stateMachineProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log("State machine step")\n      return "step"\n    }),\n    stateMachineSchedule.pipe(\n      Schedule.take(10),\n      Schedule.tapOutput((state) => Console.log(`State: ${state}`))\n    )\n  )\n})';
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
