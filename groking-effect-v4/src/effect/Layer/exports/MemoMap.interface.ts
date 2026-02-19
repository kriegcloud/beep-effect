/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: MemoMap
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.318Z
 *
 * Overview:
 * A MemoMap is used to memoize layer construction and ensure sharing of layers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 *
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Create a custom MemoMap for manual layer building
 * const program = Effect.gen(function*() {
 *   const memoMap = yield* Layer.makeMemoMap
 *   const scope = yield* Effect.scope
 *
 *   const dbLayer = Layer.succeed(Database)({
 *     query: (sql: string) => Effect.succeed("result")
 *   })
 *   const services = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
 *
 *   return ServiceMap.get(services, Database)
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MemoMap";
const exportKind = "interface";
const moduleImportPath = "effect/Layer";
const sourceSummary = "A MemoMap is used to memoize layer construction and ensure sharing of layers.";
const sourceExample =
  'import { Effect, Layer, ServiceMap } from "effect"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()("Database") {}\n\n// Create a custom MemoMap for manual layer building\nconst program = Effect.gen(function*() {\n  const memoMap = yield* Layer.makeMemoMap\n  const scope = yield* Effect.scope\n\n  const dbLayer = Layer.succeed(Database)({\n    query: (sql: string) => Effect.succeed("result")\n  })\n  const services = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)\n\n  return ServiceMap.get(services, Database)\n})';
const moduleRecord = LayerModule as Record<string, unknown>;

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
  bunContext: BunContext,
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
