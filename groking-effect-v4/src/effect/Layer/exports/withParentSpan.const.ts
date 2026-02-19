/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: withParentSpan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.319Z
 *
 * Overview:
 * Wraps a `Layer` with a new tracing span and sets the span as the parent span.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap, Tracer } from "effect"
 * 
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 * 
 * class Cache extends ServiceMap.Service<Cache, {
 *   readonly get: (key: string) => Effect.Effect<string | null>
 * }>()("Cache") {}
 * 
 * // Create layers
 * const DatabaseLayer = Layer.effect(Database, Effect.gen(function*() {
 *   yield* Effect.log("Connecting to database")
 *   return {
 *     query: (sql: string) => Effect.succeed(`DB: ${sql}`)
 *   }
 * }))
 * 
 * const CacheLayer = Layer.effect(Cache, Effect.gen(function*() {
 *   yield* Effect.log("Connecting to cache")
 *   return {
 *     get: (key: string) => Effect.succeed(`Cache: ${key}`)
 *   }
 * }))
 * 
 * // Use with an existing parent span from Effect.withSpan
 * const program = Effect.withSpan("application-startup")(
 *   Effect.gen(function*() {
 *     const parentSpan = yield* Tracer.ParentSpan
 * 
 *     // Both layers will be children of "application-startup" span
 *     const AppLayer = Layer.mergeAll(DatabaseLayer, CacheLayer).pipe(
 *       Layer.withParentSpan(parentSpan)
 *     )
 * 
 *     const services = yield* Layer.build(AppLayer)
 *     const database = ServiceMap.get(services, Database)
 *     const cache = ServiceMap.get(services, Cache)
 * 
 *     const dbResult = yield* database.query("SELECT * FROM users")
 *     const cacheResult = yield* cache.get("user:123")
 * 
 *     return { dbResult, cacheResult }
 *   })
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
const exportName = "withParentSpan";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Wraps a `Layer` with a new tracing span and sets the span as the parent span.";
const sourceExample = "import { Effect, Layer, ServiceMap, Tracer } from \"effect\"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()(\"Database\") {}\n\nclass Cache extends ServiceMap.Service<Cache, {\n  readonly get: (key: string) => Effect.Effect<string | null>\n}>()(\"Cache\") {}\n\n// Create layers\nconst DatabaseLayer = Layer.effect(Database, Effect.gen(function*() {\n  yield* Effect.log(\"Connecting to database\")\n  return {\n    query: (sql: string) => Effect.succeed(`DB: ${sql}`)\n  }\n}))\n\nconst CacheLayer = Layer.effect(Cache, Effect.gen(function*() {\n  yield* Effect.log(\"Connecting to cache\")\n  return {\n    get: (key: string) => Effect.succeed(`Cache: ${key}`)\n  }\n}))\n\n// Use with an existing parent span from Effect.withSpan\nconst program = Effect.withSpan(\"application-startup\")(\n  Effect.gen(function*() {\n    const parentSpan = yield* Tracer.ParentSpan\n\n    // Both layers will be children of \"application-startup\" span\n    const AppLayer = Layer.mergeAll(DatabaseLayer, CacheLayer).pipe(\n      Layer.withParentSpan(parentSpan)\n    )\n\n    const services = yield* Layer.build(AppLayer)\n    const database = ServiceMap.get(services, Database)\n    const cache = ServiceMap.get(services, Cache)\n\n    const dbResult = yield* database.query(\"SELECT * FROM users\")\n    const cacheResult = yield* cache.get(\"user:123\")\n\n    return { dbResult, cacheResult }\n  })\n)";
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
