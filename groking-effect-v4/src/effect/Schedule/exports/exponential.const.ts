/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: exponential
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.051Z
 *
 * Overview:
 * A schedule that always recurs, but will wait a certain amount between repetitions, given by `base * factor.pow(n)`, where `n` is the number of repetitions so far. Returns the current duration between recurrences.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Basic exponential backoff with default factor of 2
 * const basicExponential = Schedule.exponential("100 millis")
 * // Delays: 100ms, 200ms, 400ms, 800ms, 1600ms, ...
 * 
 * // Custom exponential backoff with factor 1.5
 * const gentleExponential = Schedule.exponential("200 millis", 1.5)
 * // Delays: 200ms, 300ms, 450ms, 675ms, 1012ms, ...
 * 
 * // Retry with exponential backoff (limited to 5 attempts)
 * const retryPolicy = Schedule.exponential("50 millis").pipe(
 *   Schedule.compose(Schedule.recurs(5))
 * )
 * 
 * const program = Effect.gen(function*() {
 *   let attempt = 0
 * 
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       if (attempt < 4) {
 *         yield* Console.log(`Attempt ${attempt} failed, retrying...`)
 *         yield* Effect.fail(new Error(`Failure ${attempt}`))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     retryPolicy
 *   )
 * 
 *   yield* Console.log(`Final result: ${result}`)
 * })
 * 
 * // Will retry with delays: 50ms, 100ms, 200ms before success
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
const exportName = "exponential";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "A schedule that always recurs, but will wait a certain amount between repetitions, given by `base * factor.pow(n)`, where `n` is the number of repetitions so far. Returns the cu...";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Basic exponential backoff with default factor of 2\nconst basicExponential = Schedule.exponential(\"100 millis\")\n// Delays: 100ms, 200ms, 400ms, 800ms, 1600ms, ...\n\n// Custom exponential backoff with factor 1.5\nconst gentleExponential = Schedule.exponential(\"200 millis\", 1.5)\n// Delays: 200ms, 300ms, 450ms, 675ms, 1012ms, ...\n\n// Retry with exponential backoff (limited to 5 attempts)\nconst retryPolicy = Schedule.exponential(\"50 millis\").pipe(\n  Schedule.compose(Schedule.recurs(5))\n)\n\nconst program = Effect.gen(function*() {\n  let attempt = 0\n\n  const result = yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      if (attempt < 4) {\n        yield* Console.log(`Attempt ${attempt} failed, retrying...`)\n        yield* Effect.fail(new Error(`Failure ${attempt}`))\n      }\n      return `Success on attempt ${attempt}`\n    }),\n    retryPolicy\n  )\n\n  yield* Console.log(`Final result: ${result}`)\n})\n\n// Will retry with delays: 50ms, 100ms, 200ms before success";
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
