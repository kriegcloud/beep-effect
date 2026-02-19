/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LayerMap
 * Export: fromRecord
 * Kind: const
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
 * // Define service keys
 * const DevDatabase = ServiceMap.Service<{
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>("DevDatabase")
 *
 * const ProdDatabase = ServiceMap.Service<{
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>("ProdDatabase")
 *
 * // Create predefined layers
 * const layers = {
 *   development: Layer.succeed(DevDatabase)({
 *     query: (sql) => Effect.succeed(`DEV: ${sql}`)
 *   }),
 *   production: Layer.succeed(ProdDatabase)({
 *     query: (sql) => Effect.succeed(`PROD: ${sql}`)
 *   })
 * } as const
 *
 * // Create a LayerMap from the record
 * const program = Effect.gen(function*() {
 *   const layerMap = yield* LayerMap.fromRecord(layers, {
 *     idleTimeToLive: "10 seconds"
 *   })
 *
 *   // Get layers by key
 *   const devLayer = layerMap.get("development")
 *   const prodLayer = layerMap.get("production")
 *
 *   console.log("LayerMap created from record")
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
import * as LayerMapModule from "effect/LayerMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromRecord";
const exportKind = "const";
const moduleImportPath = "effect/LayerMap";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect, Layer, LayerMap, ServiceMap } from "effect"\n\n// Define service keys\nconst DevDatabase = ServiceMap.Service<{\n  readonly query: (sql: string) => Effect.Effect<string>\n}>("DevDatabase")\n\nconst ProdDatabase = ServiceMap.Service<{\n  readonly query: (sql: string) => Effect.Effect<string>\n}>("ProdDatabase")\n\n// Create predefined layers\nconst layers = {\n  development: Layer.succeed(DevDatabase)({\n    query: (sql) => Effect.succeed(`DEV: ${sql}`)\n  }),\n  production: Layer.succeed(ProdDatabase)({\n    query: (sql) => Effect.succeed(`PROD: ${sql}`)\n  })\n} as const\n\n// Create a LayerMap from the record\nconst program = Effect.gen(function*() {\n  const layerMap = yield* LayerMap.fromRecord(layers, {\n    idleTimeToLive: "10 seconds"\n  })\n\n  // Get layers by key\n  const devLayer = layerMap.get("development")\n  const prodLayer = layerMap.get("production")\n\n  console.log("LayerMap created from record")\n})';
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
