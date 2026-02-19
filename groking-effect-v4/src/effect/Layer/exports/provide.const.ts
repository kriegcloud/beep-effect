/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: provide
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.318Z
 *
 * Overview:
 * Feeds the output services of this builder into the input of the specified builder, resulting in a new builder with the inputs of this builder as well as any leftover inputs, and the outputs of the specified builder.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 *
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class UserService extends ServiceMap.Service<UserService, {
 *   readonly getUser: (id: string) => Effect.Effect<{
 *     id: string
 *     name: string
 *   }>
 * }>()("UserService") {}
 *
 * class Logger extends ServiceMap.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Create dependency layers
 * const databaseLayer = Layer.succeed(Database)({
 *   query: (sql: string) => Effect.succeed(`DB: ${sql}`)
 * })
 *
 * const loggerLayer = Layer.succeed(Logger)({
 *   log: (msg: string) => Effect.sync(() => console.log(`[LOG] ${msg}`))
 * })
 *
 * // UserService depends on Database and Logger
 * const userServiceLayer = Layer.effect(UserService)(Effect.gen(function*() {
 *   const database = yield* Database
 *   const logger = yield* Logger
 *
 *   return {
 *     getUser: (id: string) =>
 *       Effect.gen(function*() {
 *         yield* logger.log(`Looking up user ${id}`)
 *         const result = yield* database.query(
 *           `SELECT * FROM users WHERE id = ${id}`
 *         )
 *         return { id, name: result }
 *       })
 *   }
 * }))
 *
 * // Provide dependencies to UserService layer
 * const userServiceWithDependencies = userServiceLayer.pipe(
 *   Layer.provide(Layer.mergeAll(databaseLayer, loggerLayer))
 * )
 *
 * // Now UserService layer has no dependencies
 * const program = Effect.gen(function*() {
 *   const userService = yield* UserService
 *   return yield* userService.getUser("123")
 * }).pipe(
 *   Effect.provide(userServiceWithDependencies)
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
const exportName = "provide";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary =
  "Feeds the output services of this builder into the input of the specified builder, resulting in a new builder with the inputs of this builder as well as any leftover inputs, and...";
const sourceExample =
  'import { Effect, Layer, ServiceMap } from "effect"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()("Database") {}\n\nclass UserService extends ServiceMap.Service<UserService, {\n  readonly getUser: (id: string) => Effect.Effect<{\n    id: string\n    name: string\n  }>\n}>()("UserService") {}\n\nclass Logger extends ServiceMap.Service<Logger, {\n  readonly log: (msg: string) => Effect.Effect<void>\n}>()("Logger") {}\n\n// Create dependency layers\nconst databaseLayer = Layer.succeed(Database)({\n  query: (sql: string) => Effect.succeed(`DB: ${sql}`)\n})\n\nconst loggerLayer = Layer.succeed(Logger)({\n  log: (msg: string) => Effect.sync(() => console.log(`[LOG] ${msg}`))\n})\n\n// UserService depends on Database and Logger\nconst userServiceLayer = Layer.effect(UserService)(Effect.gen(function*() {\n  const database = yield* Database\n  const logger = yield* Logger\n\n  return {\n    getUser: (id: string) =>\n      Effect.gen(function*() {\n        yield* logger.log(`Looking up user ${id}`)\n        const result = yield* database.query(\n          `SELECT * FROM users WHERE id = ${id}`\n        )\n        return { id, name: result }\n      })\n  }\n}))\n\n// Provide dependencies to UserService layer\nconst userServiceWithDependencies = userServiceLayer.pipe(\n  Layer.provide(Layer.mergeAll(databaseLayer, loggerLayer))\n)\n\n// Now UserService layer has no dependencies\nconst program = Effect.gen(function*() {\n  const userService = yield* UserService\n  return yield* userService.getUser("123")\n}).pipe(\n  Effect.provide(userServiceWithDependencies)\n)';
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
