/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: catchCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.317Z
 *
 * Overview:
 * Recovers from all errors.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Layer, ServiceMap } from "effect"
 * 
 * class DatabaseError extends Data.TaggedError("DatabaseError")<{
 *   message: string
 * }> {}
 * 
 * class NetworkError extends Data.TaggedError("NetworkError")<{
 *   reason: string
 * }> {}
 * 
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 * 
 * class Logger extends ServiceMap.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 * 
 * // Primary database layer that might fail
 * const primaryDatabaseLayer = Layer.effect(Database)(Effect.gen(function*() {
 *   yield* Effect.fail(new DatabaseError({ message: "Primary DB unreachable" }))
 *   return { query: (sql: string) => Effect.succeed(`Primary: ${sql}`) }
 * }))
 * 
 * // Fallback layers for different error causes
 * const databaseWithFallback = primaryDatabaseLayer.pipe(
 *   Layer.catchCause(() => {
 *     // For any cause/error, fallback to in-memory database
 *     return Layer.mergeAll(
 *       Layer.succeed(Database)({
 *         query: (sql: string) => Effect.succeed(`Memory: ${sql}`)
 *       }),
 *       Layer.succeed(Logger)({
 *         log: (msg: string) =>
 *           Effect.sync(() => console.log(`[FALLBACK] ${msg}`))
 *       })
 *     )
 *   })
 * )
 * 
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   return yield* database.query("SELECT * FROM users")
 * }).pipe(
 *   Effect.provide(databaseWithFallback)
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
import * as LayerModule from "effect/Layer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchCause";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Recovers from all errors.";
const sourceExample = "import { Data, Effect, Layer, ServiceMap } from \"effect\"\n\nclass DatabaseError extends Data.TaggedError(\"DatabaseError\")<{\n  message: string\n}> {}\n\nclass NetworkError extends Data.TaggedError(\"NetworkError\")<{\n  reason: string\n}> {}\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()(\"Database\") {}\n\nclass Logger extends ServiceMap.Service<Logger, {\n  readonly log: (msg: string) => Effect.Effect<void>\n}>()(\"Logger\") {}\n\n// Primary database layer that might fail\nconst primaryDatabaseLayer = Layer.effect(Database)(Effect.gen(function*() {\n  yield* Effect.fail(new DatabaseError({ message: \"Primary DB unreachable\" }))\n  return { query: (sql: string) => Effect.succeed(`Primary: ${sql}`) }\n}))\n\n// Fallback layers for different error causes\nconst databaseWithFallback = primaryDatabaseLayer.pipe(\n  Layer.catchCause(() => {\n    // For any cause/error, fallback to in-memory database\n    return Layer.mergeAll(\n      Layer.succeed(Database)({\n        query: (sql: string) => Effect.succeed(`Memory: ${sql}`)\n      }),\n      Layer.succeed(Logger)({\n        log: (msg: string) =>\n          Effect.sync(() => console.log(`[FALLBACK] ${msg}`))\n      })\n    )\n  })\n)\n\nconst program = Effect.gen(function*() {\n  const database = yield* Database\n  return yield* database.query(\"SELECT * FROM users\")\n}).pipe(\n  Effect.provide(databaseWithFallback)\n)";
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
