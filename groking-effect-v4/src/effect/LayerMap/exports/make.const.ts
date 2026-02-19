/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LayerMap
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/LayerMap.ts
 * Generated: 2026-02-19T04:14:14.492Z
 *
 * Overview:
 * A `LayerMap` allows you to create a map of Layer's that can be used to dynamically access resources based on a key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, LayerMap, ServiceMap } from "effect"
 * 
 * // Define a service key
 * const DatabaseService = ServiceMap.Service<{
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>("Database")
 * 
 * // Create a LayerMap that provides different database configurations
 * const program = Effect.gen(function*() {
 *   const layerMap = yield* LayerMap.make(
 *     (env: string) =>
 *       Layer.succeed(DatabaseService)({
 *         query: (sql) => Effect.succeed(`${env}: ${sql}`)
 *       }),
 *     { idleTimeToLive: "5 seconds" }
 *   )
 * 
 *   // Get a layer for a specific environment
 *   const devLayer = layerMap.get("development")
 * 
 *   // Use the layer to provide the service
 *   const result = yield* Effect.provide(
 *     Effect.gen(function*() {
 *       const db = yield* DatabaseService
 *       return yield* db.query("SELECT * FROM users")
 *     }),
 *     devLayer
 *   )
 * 
 *   console.log(result) // "development: SELECT * FROM users"
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
import * as LayerMapModule from "effect/LayerMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/LayerMap";
const sourceSummary = "A `LayerMap` allows you to create a map of Layer's that can be used to dynamically access resources based on a key.";
const sourceExample = "import { Effect, Layer, LayerMap, ServiceMap } from \"effect\"\n\n// Define a service key\nconst DatabaseService = ServiceMap.Service<{\n  readonly query: (sql: string) => Effect.Effect<string>\n}>(\"Database\")\n\n// Create a LayerMap that provides different database configurations\nconst program = Effect.gen(function*() {\n  const layerMap = yield* LayerMap.make(\n    (env: string) =>\n      Layer.succeed(DatabaseService)({\n        query: (sql) => Effect.succeed(`${env}: ${sql}`)\n      }),\n    { idleTimeToLive: \"5 seconds\" }\n  )\n\n  // Get a layer for a specific environment\n  const devLayer = layerMap.get(\"development\")\n\n  // Use the layer to provide the service\n  const result = yield* Effect.provide(\n    Effect.gen(function*() {\n      const db = yield* DatabaseService\n      return yield* db.query(\"SELECT * FROM users\")\n    }),\n    devLayer\n  )\n\n  console.log(result) // \"development: SELECT * FROM users\"\n})";
const moduleRecord = LayerMapModule as Record<string, unknown>;

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
