/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Metric
 * Export: enableRuntimeMetricsLayer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Metric.ts
 * Generated: 2026-02-19T04:14:14.960Z
 *
 * Overview:
 * A Layer that enables automatic collection of fiber runtime metrics across an entire Effect application.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Data, Effect, Layer, Metric } from "effect"
 *
 * class AppError extends Data.TaggedError("AppError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Define your application logic
 * const userService = Effect.gen(function*() {
 *   // Simulate user operations with concurrent processing
 *   const fetchUser = (id: number) =>
 *     Effect.gen(function*() {
 *       yield* Effect.sleep(`${50 + id * 10} millis`)
 *       if (id % 7 === 0) {
 *         yield* Effect.fail(new AppError({ operation: `fetch-user-${id}` }))
 *       }
 *       return { id, name: `User ${id}`, email: `user${id}@example.com` }
 *     })
 *
 *   // Process multiple users concurrently (ignoring failures for demo)
 *   const userIds = Array.from({ length: 10 }, (_, i) => i + 1)
 *   const userTasks = userIds.map((id) =>
 *     fetchUser(id).pipe(Effect.catchTag("AppError", () => Effect.succeed(null)))
 *   )
 *   const allUsers = yield* Effect.all(userTasks, { concurrency: 4 })
 *   const successfulUsers = allUsers.filter((user) => user !== null)
 *   return successfulUsers
 * })
 *
 * const analyticsService = Effect.gen(function*() {
 *   // Simulate analytics processing
 *   const tasks = Array.from({ length: 8 }, (_, i) =>
 *     Effect.gen(function*() {
 *       yield* Effect.sleep(`${100 + i * 25} millis`)
 *       return `Analytics task ${i} completed`
 *     }))
 *   return yield* Effect.all(tasks, { concurrency: 3 })
 * })
 *
 * // Main application that uses multiple services
 * const application = Effect.gen(function*() {
 *   yield* Console.log("Starting application with runtime metrics...")
 *
 *   // Run services concurrently
 *   const [users, analytics] = yield* Effect.all([
 *     userService,
 *     analyticsService
 *   ], { concurrency: 2 })
 *
 *   yield* Console.log(
 *     `Processed ${users.length} users and ${analytics.length} analytics tasks`
 *   )
 *
 *   // Inspect the automatically collected runtime metrics
 *   const metrics = yield* Metric.snapshot
 *   const runtimeMetrics = metrics.filter((m) => m.id.startsWith("child_fiber"))
 *
 *   yield* Console.log("Runtime Metrics Collected:")
 *   for (const metric of runtimeMetrics) {
 *     yield* Console.log(`  ${metric.id}: ${JSON.stringify(metric.state)}`)
 *   }
 *
 *   return { users, analytics, metricsCount: runtimeMetrics.length }
 * })
 *
 * // Create the base application layer
 * const AppLayer = Layer.empty // Add your application layers here (database, HTTP, etc.)
 *
 * // Add runtime metrics layer at the end
 * const AppLayerWithMetrics = AppLayer.pipe(
 *   Layer.provide(Metric.enableRuntimeMetricsLayer)
 * )
 *
 * // Run the application with runtime metrics enabled
 * const program = application.pipe(
 *   Effect.provide(AppLayerWithMetrics)
 * )
 *
 * // Alternative: Provide runtime metrics directly to the application
 * const programWithDirectMetrics = application.pipe(
 *   Effect.provide(Metric.enableRuntimeMetricsLayer)
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MetricModule from "effect/Metric";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "enableRuntimeMetricsLayer";
const exportKind = "const";
const moduleImportPath = "effect/Metric";
const sourceSummary =
  "A Layer that enables automatic collection of fiber runtime metrics across an entire Effect application.";
const sourceExample =
  'import { Console, Data, Effect, Layer, Metric } from "effect"\n\nclass AppError extends Data.TaggedError("AppError")<{\n  readonly operation: string\n}> {}\n\n// Define your application logic\nconst userService = Effect.gen(function*() {\n  // Simulate user operations with concurrent processing\n  const fetchUser = (id: number) =>\n    Effect.gen(function*() {\n      yield* Effect.sleep(`${50 + id * 10} millis`)\n      if (id % 7 === 0) {\n        yield* Effect.fail(new AppError({ operation: `fetch-user-${id}` }))\n      }\n      return { id, name: `User ${id}`, email: `user${id}@example.com` }\n    })\n\n  // Process multiple users concurrently (ignoring failures for demo)\n  const userIds = Array.from({ length: 10 }, (_, i) => i + 1)\n  const userTasks = userIds.map((id) =>\n    fetchUser(id).pipe(Effect.catchTag("AppError", () => Effect.succeed(null)))\n  )\n  const allUsers = yield* Effect.all(userTasks, { concurrency: 4 })\n  const successfulUsers = allUsers.filter((user) => user !== null)\n  return successfulUsers\n})\n\nconst analyticsService = Effect.gen(function*() {\n  // Simulate analytics processing\n  const tasks = Array.from({ length: 8 }, (_, i) =>\n    Effect.gen(function*() {\n      yield* Effect.sleep(`${100 + i * 25} millis`)\n      return `Analytics task ${i} completed`\n    }))\n  return yield* Effect.all(tasks, { concurrency: 3 })\n})\n\n// Main application that uses multiple services\nconst application = Effect.gen(function*() {\n  yield* Console.log("Starting application with runtime metrics...")\n\n  // Run services concurrently\n  const [users, analytics] = yield* Effect.all([\n    userService,\n    analyticsService\n  ], { concurrency: 2 })\n\n  yield* Console.log(\n    `Processed ${users.length} users and ${analytics.length} analytics tasks`\n  )\n\n  // Inspect the automatically collected runtime metrics\n  const metrics = yield* Metric.snapshot\n  const runtimeMetrics = metrics.filter((m) => m.id.startsWith("child_fiber"))\n\n  yield* Console.log("Runtime Metrics Collected:")\n  for (const metric of runtimeMetrics) {\n    yield* Console.log(`  ${metric.id}: ${JSON.stringify(metric.state)}`)\n  }\n\n  return { users, analytics, metricsCount: runtimeMetrics.length }\n})\n\n// Create the base application layer\nconst AppLayer = Layer.empty // Add your application layers here (database, HTTP, etc.)\n\n// Add runtime metrics layer at the end\nconst AppLayerWithMetrics = AppLayer.pipe(\n  Layer.provide(Metric.enableRuntimeMetricsLayer)\n)\n\n// Run the application with runtime metrics enabled\nconst program = application.pipe(\n  Effect.provide(AppLayerWithMetrics)\n)\n\n// Alternative: Provide runtime metrics directly to the application\nconst programWithDirectMetrics = application.pipe(\n  Effect.provide(Metric.enableRuntimeMetricsLayer)\n)';
const moduleRecord = MetricModule as Record<string, unknown>;

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
