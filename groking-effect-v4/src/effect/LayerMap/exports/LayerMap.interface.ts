/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LayerMap
 * Export: LayerMap
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/LayerMap.ts
 * Generated: 2026-02-19T04:50:37.405Z
 *
 * Overview:
 * No summary found in JSDoc.
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
 * const createDatabaseLayerMap = LayerMap.make((env: string) =>
 *   Layer.succeed(DatabaseService)({
 *     query: (sql) => Effect.succeed(`${env}: ${sql}`)
 *   })
 * )
 *
 * // Use the LayerMap
 * const program = Effect.gen(function*() {
 *   const layerMap = yield* createDatabaseLayerMap
 *
 *   // Get a layer for a specific environment
 *   const devLayer = layerMap.get("development")
 *
 *   // Get services directly
 *   const services = yield* layerMap.services("production")
 *
 *   // Invalidate a cached layer
 *   yield* layerMap.invalidate("development")
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LayerMapModule from "effect/LayerMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "LayerMap";
const exportKind = "interface";
const moduleImportPath = "effect/LayerMap";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect, Layer, LayerMap, ServiceMap } from "effect"\n\n// Define a service key\nconst DatabaseService = ServiceMap.Service<{\n  readonly query: (sql: string) => Effect.Effect<string>\n}>("Database")\n\n// Create a LayerMap that provides different database configurations\nconst createDatabaseLayerMap = LayerMap.make((env: string) =>\n  Layer.succeed(DatabaseService)({\n    query: (sql) => Effect.succeed(`${env}: ${sql}`)\n  })\n)\n\n// Use the LayerMap\nconst program = Effect.gen(function*() {\n  const layerMap = yield* createDatabaseLayerMap\n\n  // Get a layer for a specific environment\n  const devLayer = layerMap.get("development")\n\n  // Get services directly\n  const services = yield* layerMap.services("production")\n\n  // Invalidate a cached layer\n  yield* layerMap.invalidate("development")\n})';
const moduleRecord = LayerMapModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
