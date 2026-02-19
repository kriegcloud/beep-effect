/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: withSpan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.319Z
 *
 * Overview:
 * Wraps a Layer with a new tracing span, making all operations in the layer constructor part of the named trace span.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 *
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends ServiceMap.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Create layers with tracing
 * const databaseLayer = Layer.effect(Database, Effect.gen(function*() {
 *   yield* Effect.log("Connecting to database")
 *   yield* Effect.sleep("100 millis")
 *   return {
 *     query: (sql: string) => Effect.succeed(`Result: ${sql}`)
 *   }
 * })).pipe(Layer.withSpan("database-initialization", {
 *   attributes: { dbType: "postgres" }
 * }))
 *
 * const loggerLayer = Layer.succeed(Logger, {
 *   log: (msg: string) => Effect.sync(() => console.log(msg))
 * }).pipe(Layer.withSpan("logger-initialization"))
 *
 * // Combine traced layers
 * const appLayer = Layer.mergeAll(databaseLayer, loggerLayer).pipe(
 *   Layer.withSpan("app-initialization", {
 *     onEnd: (span, exit) =>
 *       Effect.sync(() => {
 *         console.log(`Application initialization completed: ${exit._tag}`)
 *       })
 *   })
 * )
 *
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   const logger = yield* Logger
 *
 *   yield* logger.log("Application ready")
 *   return yield* database.query("SELECT * FROM users")
 * }).pipe(Effect.provide(appLayer)
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
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withSpan";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary =
  "Wraps a Layer with a new tracing span, making all operations in the layer constructor part of the named trace span.";
const sourceExample =
  'import { Effect, Layer, ServiceMap } from "effect"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()("Database") {}\n\nclass Logger extends ServiceMap.Service<Logger, {\n  readonly log: (msg: string) => Effect.Effect<void>\n}>()("Logger") {}\n\n// Create layers with tracing\nconst databaseLayer = Layer.effect(Database, Effect.gen(function*() {\n  yield* Effect.log("Connecting to database")\n  yield* Effect.sleep("100 millis")\n  return {\n    query: (sql: string) => Effect.succeed(`Result: ${sql}`)\n  }\n})).pipe(Layer.withSpan("database-initialization", {\n  attributes: { dbType: "postgres" }\n}))\n\nconst loggerLayer = Layer.succeed(Logger, {\n  log: (msg: string) => Effect.sync(() => console.log(msg))\n}).pipe(Layer.withSpan("logger-initialization"))\n\n// Combine traced layers\nconst appLayer = Layer.mergeAll(databaseLayer, loggerLayer).pipe(\n  Layer.withSpan("app-initialization", {\n    onEnd: (span, exit) =>\n      Effect.sync(() => {\n        console.log(`Application initialization completed: ${exit._tag}`)\n      })\n  })\n)\n\nconst program = Effect.gen(function*() {\n  const database = yield* Database\n  const logger = yield* Logger\n\n  yield* logger.log("Application ready")\n  return yield* database.query("SELECT * FROM users")\n}).pipe(Effect.provide(appLayer)\n)';
const moduleRecord = LayerModule as Record<string, unknown>;

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
