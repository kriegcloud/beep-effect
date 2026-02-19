/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: andThen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:50:39.066Z
 *
 * Overview:
 * Returns a new `Schedule` that will first execute the left (i.e. `self`) schedule to completion. Once the left schedule is complete, the right (i.e. `other`) schedule will be executed to completion.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // First retry 3 times quickly, then switch to slower retries
 * const quickRetries = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(3)
 * )
 * const slowRetries = Schedule.exponential("1 second").pipe(
 *   Schedule.take(2)
 * )
 *
 * const combinedRetries = Schedule.andThen(quickRetries, slowRetries)
 *
 * const program = Effect.gen(function*() {
 *   let attempt = 0
 *   yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 *       if (attempt < 6) {
 *         yield* Effect.fail(new Error(`Failure ${attempt}`))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     combinedRetries
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScheduleModule from "effect/Schedule";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "andThen";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary =
  "Returns a new `Schedule` that will first execute the left (i.e. `self`) schedule to completion. Once the left schedule is complete, the right (i.e. `other`) schedule will be exe...";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\n// First retry 3 times quickly, then switch to slower retries\nconst quickRetries = Schedule.exponential("100 millis").pipe(\n  Schedule.take(3)\n)\nconst slowRetries = Schedule.exponential("1 second").pipe(\n  Schedule.take(2)\n)\n\nconst combinedRetries = Schedule.andThen(quickRetries, slowRetries)\n\nconst program = Effect.gen(function*() {\n  let attempt = 0\n  yield* Effect.retry(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Attempt ${attempt}`)\n      if (attempt < 6) {\n        yield* Effect.fail(new Error(`Failure ${attempt}`))\n      }\n      return `Success on attempt ${attempt}`\n    }),\n    combinedRetries\n  )\n})';
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
