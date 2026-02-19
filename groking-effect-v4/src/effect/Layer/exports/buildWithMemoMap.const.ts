/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: buildWithMemoMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.317Z
 *
 * Overview:
 * Builds a layer into an `Effect` value, using the specified `MemoMap` to memoize the layer construction.
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
 * // Build layers with explicit memoization control
 * const program = Effect.gen(function*() {
 *   const memoMap = yield* Layer.makeMemoMap
 *   const scope = yield* Effect.scope
 * 
 *   // Build database layer with memoization
 *   const dbLayer = Layer.succeed(Database)({
 *     query: (sql: string) => Effect.succeed("result")
 *   })
 *   const dbServices = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
 * 
 *   // Build logger layer with same memoization (reuses memo if same layer)
 *   const loggerLayer = Layer.succeed(Logger)({
 *     log: (msg: string) => Effect.sync(() => console.log(msg))
 *   })
 *   const loggerServices = yield* Layer.buildWithMemoMap(
 *     loggerLayer,
 *     memoMap,
 *     scope
 *   )
 * 
 *   return {
 *     database: ServiceMap.get(dbServices, Database),
 *     logger: ServiceMap.get(loggerServices, Logger)
 *   }
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
import * as LayerModule from "effect/Layer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "buildWithMemoMap";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Builds a layer into an `Effect` value, using the specified `MemoMap` to memoize the layer construction.";
const sourceExample = "import { Effect, Layer, ServiceMap } from \"effect\"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()(\"Database\") {}\n\nclass Logger extends ServiceMap.Service<Logger, {\n  readonly log: (msg: string) => Effect.Effect<void>\n}>()(\"Logger\") {}\n\n// Build layers with explicit memoization control\nconst program = Effect.gen(function*() {\n  const memoMap = yield* Layer.makeMemoMap\n  const scope = yield* Effect.scope\n\n  // Build database layer with memoization\n  const dbLayer = Layer.succeed(Database)({\n    query: (sql: string) => Effect.succeed(\"result\")\n  })\n  const dbServices = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)\n\n  // Build logger layer with same memoization (reuses memo if same layer)\n  const loggerLayer = Layer.succeed(Logger)({\n    log: (msg: string) => Effect.sync(() => console.log(msg))\n  })\n  const loggerServices = yield* Layer.buildWithMemoMap(\n    loggerLayer,\n    memoMap,\n    scope\n  )\n\n  return {\n    database: ServiceMap.get(dbServices, Database),\n    logger: ServiceMap.get(loggerServices, Logger)\n  }\n})";
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
