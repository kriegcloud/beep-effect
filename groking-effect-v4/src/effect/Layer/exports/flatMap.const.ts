/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.317Z
 *
 * Overview:
 * Constructs a layer dynamically based on the output of this layer.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 * 
 * class Config extends ServiceMap.Service<Config, {
 *   readonly dbUrl: string
 *   readonly logLevel: string
 * }>()("Config") {}
 * 
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 * 
 * class Logger extends ServiceMap.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 * 
 * // Base config layer
 * const configLayer = Layer.succeed(Config)({
 *   dbUrl: "postgres://localhost:5432/mydb",
 *   logLevel: "debug"
 * })
 * 
 * // Dynamically create services based on config
 * const dynamicServiceLayer = configLayer.pipe(
 *   Layer.flatMap((services) => {
 *     const config = ServiceMap.get(services, Config)
 * 
 *     // Create database layer based on config
 *     const dbLayer = Layer.succeed(Database)({
 *       query: (sql: string) =>
 *         Effect.succeed(
 *           `Querying ${config.dbUrl}: ${sql}`
 *         )
 *     })
 * 
 *     // Create logger layer based on config
 *     const loggerLayer = Layer.succeed(Logger)({
 *       log: (msg: string) =>
 *         config.logLevel === "debug"
 *           ? Effect.sync(() => console.log(`[DEBUG] ${msg}`))
 *           : Effect.sync(() => console.log(msg))
 *     })
 * 
 *     // Return combined layer
 *     return Layer.mergeAll(dbLayer, loggerLayer)
 *   })
 * )
 * 
 * // Use the dynamic services
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   const logger = yield* Logger
 * 
 *   yield* logger.log("Starting database query")
 *   const result = yield* database.query("SELECT * FROM users")
 * 
 *   return result
 * }).pipe(
 *   Effect.provide(dynamicServiceLayer)
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
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Constructs a layer dynamically based on the output of this layer.";
const sourceExample = "import { Effect, Layer, ServiceMap } from \"effect\"\n\nclass Config extends ServiceMap.Service<Config, {\n  readonly dbUrl: string\n  readonly logLevel: string\n}>()(\"Config\") {}\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()(\"Database\") {}\n\nclass Logger extends ServiceMap.Service<Logger, {\n  readonly log: (msg: string) => Effect.Effect<void>\n}>()(\"Logger\") {}\n\n// Base config layer\nconst configLayer = Layer.succeed(Config)({\n  dbUrl: \"postgres://localhost:5432/mydb\",\n  logLevel: \"debug\"\n})\n\n// Dynamically create services based on config\nconst dynamicServiceLayer = configLayer.pipe(\n  Layer.flatMap((services) => {\n    const config = ServiceMap.get(services, Config)\n\n    // Create database layer based on config\n    const dbLayer = Layer.succeed(Database)({\n      query: (sql: string) =>\n        Effect.succeed(\n          `Querying ${config.dbUrl}: ${sql}`\n        )\n    })\n\n    // Create logger layer based on config\n    const loggerLayer = Layer.succeed(Logger)({\n      log: (msg: string) =>\n        config.logLevel === \"debug\"\n          ? Effect.sync(() => console.log(`[DEBUG] ${msg}`))\n          : Effect.sync(() => console.log(msg))\n    })\n\n    // Return combined layer\n    return Layer.mergeAll(dbLayer, loggerLayer)\n  })\n)\n\n// Use the dynamic services\nconst program = Effect.gen(function*() {\n  const database = yield* Database\n  const logger = yield* Logger\n\n  yield* logger.log(\"Starting database query\")\n  const result = yield* database.query(\"SELECT * FROM users\")\n\n  return result\n}).pipe(\n  Effect.provide(dynamicServiceLayer)\n)";
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
