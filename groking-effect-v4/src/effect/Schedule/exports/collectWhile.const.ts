/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: collectWhile
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.050Z
 *
 * Overview:
 * Returns a new `Schedule` that recurs as long as the specified `predicate` returns `true`, collecting all outputs of the schedule into an array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Collect outputs while under time limit
 * const collectForTime = Schedule.collectWhile(
 *   Schedule.spaced("500 millis"),
 *   (metadata) => Effect.succeed(metadata.elapsed < 3000) // Stop after 3 seconds
 * )
 * 
 * const timeBasedProgram = Effect.gen(function*() {
 *   const results = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const value = Math.floor(Math.random() * 100)
 *       yield* Console.log(`Generated value: ${value}`)
 *       return value
 *     }),
 *     collectForTime
 *   )
 * 
 *   yield* Console.log(
 *     `Collected ${results.length} values: [${results.join(", ")}]`
 *   )
 * })
 * 
 * // Collect outputs while condition is met
 * const collectWhileSmall = Schedule.collectWhile(
 *   Schedule.exponential("100 millis"),
 *   (metadata) =>
 *     Effect.succeed(metadata.attempt <= 5 && metadata.elapsed < 2000)
 * )
 * 
 * const conditionalProgram = Effect.gen(function*() {
 *   let attempt = 0
 * 
 *   const delays = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Retry attempt ${attempt}`)
 *       return `${Date.now()}`
 *     }),
 *     collectWhileSmall
 *   )
 * 
 *   yield* Console.log(`Collected attempts: [${delays.join(", ")}]`)
 * })
 * 
 * // Collect with effectful predicate
 * const collectWithCheck = Schedule.collectWhile(
 *   Schedule.fixed("1 second"),
 *   (metadata) =>
 *     Effect.gen(function*() {
 *       const shouldContinue = metadata.attempt < 5
 *       yield* Console.log(
 *         `Check ${metadata.attempt}: continue = ${shouldContinue}`
 *       )
 *       return shouldContinue
 *     })
 * )
 * 
 * const effectfulProgram = Effect.gen(function*() {
 *   const timestamps = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const now = new Date().toISOString()
 *       yield* Console.log(`Task at ${now}`)
 *       return now
 *     }),
 *     collectWithCheck
 *   )
 * 
 *   yield* Console.log(`Final collection: ${timestamps.length} items`)
 * })
 * 
 * // Collect samples with condition
 * const collectSamples = Schedule.collectWhile(
 *   Schedule.spaced("200 millis"),
 *   (metadata) =>
 *     Effect.succeed(metadata.attempt <= 5 && metadata.elapsed < 2000)
 * )
 * 
 * const samplingProgram = Effect.gen(function*() {
 *   const samples = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const sample = Math.random() * 100
 *       yield* Console.log(`Sample: ${sample.toFixed(1)}`)
 *       return sample
 *     }),
 *     collectSamples
 *   )
 * 
 *   const average = samples.reduce((sum, s) => sum + s, 0) / samples.length
 *   yield* Console.log(
 *     `Collected ${samples.length} samples, average: ${average.toFixed(1)}`
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
const exportName = "collectWhile";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a new `Schedule` that recurs as long as the specified `predicate` returns `true`, collecting all outputs of the schedule into an array.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Collect outputs while under time limit\nconst collectForTime = Schedule.collectWhile(\n  Schedule.spaced(\"500 millis\"),\n  (metadata) => Effect.succeed(metadata.elapsed < 3000) // Stop after 3 seconds\n)\n\nconst timeBasedProgram = Effect.gen(function*() {\n  const results = yield* Effect.repeat(\n    Effect.gen(function*() {\n      const value = Math.floor(Math.random() * 100)\n      yield* Console.log(`Generated value: ${value}`)\n      return value\n    }),\n    collectForTime\n  )\n\n  yield* Console.log(\n    `Collected ${results.length} values: [${results.join(\", \")}]`\n  )\n})\n\n// Collect outputs while condition is met\nconst collectWhileSmall = Schedule.collectWhile(\n  Schedule.exponential(\"100 millis\"),\n  (metadata) =>\n    Effect.succeed(metadata.attempt <= 5 && metadata.elapsed < 2000)\n)\n\nconst conditionalProgram = Effect.gen(function*() {\n  let attempt = 0\n\n  const delays = yield* Effect.repeat(\n    Effect.gen(function*() {\n      attempt++\n      yield* Console.log(`Retry attempt ${attempt}`)\n      return `${Date.now()}`\n    }),\n    collectWhileSmall\n  )\n\n  yield* Console.log(`Collected attempts: [${delays.join(\", \")}]`)\n})\n\n// Collect with effectful predicate\nconst collectWithCheck = Schedule.collectWhile(\n  Schedule.fixed(\"1 second\"),\n  (metadata) =>\n    Effect.gen(function*() {\n      const shouldContinue = metadata.attempt < 5\n      yield* Console.log(\n        `Check ${metadata.attempt}: continue = ${shouldContinue}`\n      )\n      return shouldContinue\n    })\n)\n\nconst effectfulProgram = Effect.gen(function*() {\n  const timestamps = yield* Effect.repeat(\n    Effect.gen(function*() {\n      const now = new Date().toISOString()\n      yield* Console.log(`Task at ${now}`)\n      return now\n    }),\n    collectWithCheck\n  )\n\n  yield* Console.log(`Final collection: ${timestamps.length} items`)\n})\n\n// Collect samples with condition\nconst collectSamples = Schedule.collectWhile(\n  Schedule.spaced(\"200 millis\"),\n  (metadata) =>\n    Effect.succeed(metadata.attempt <= 5 && metadata.elapsed < 2000)\n)\n\nconst samplingProgram = Effect.gen(function*() {\n  const samples = yield* Effect.repeat(\n    Effect.gen(function*() {\n      const sample = Math.random() * 100\n      yield* Console.log(`Sample: ${sample.toFixed(1)}`)\n      return sample\n    }),\n    collectSamples\n  )\n\n  const average = samples.reduce((sum, s) => sum + s, 0) / samples.length\n  yield* Console.log(\n    `Collected ${samples.length} samples, average: ${average.toFixed(1)}`\n  )\n})";
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
