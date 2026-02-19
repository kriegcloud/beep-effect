/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: parentSpan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:50:37.315Z
 *
 * Overview:
 * Constructs a new `Layer` which takes an existing span and registers it as the current parent span.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Layer, ServiceMap, Tracer } from "effect"
 *
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Create a layer that uses an existing span as parent
 * const databaseLayer = Layer.effect(
 *   Database,
 *   Effect.gen(function*() {
 *     yield* Effect.log("Initializing database")
 *
 *     const parentSpan = yield* Effect.currentParentSpan
 *     yield* Console.log(parentSpan.spanId) // "42"
 *
 *     return {
 *       query: (sql: string) => Effect.succeed(`Result: ${sql}`)
 *     }
 *   })
 * ).pipe(Layer.provide(Layer.parentSpan(Tracer.externalSpan({
 *   spanId: "42",
 *   traceId: "000"
 * }))))
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
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "parentSpan";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary =
  "Constructs a new `Layer` which takes an existing span and registers it as the current parent span.";
const sourceExample =
  'import { Console, Effect, Layer, ServiceMap, Tracer } from "effect"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()("Database") {}\n\n// Create a layer that uses an existing span as parent\nconst databaseLayer = Layer.effect(\n  Database,\n  Effect.gen(function*() {\n    yield* Effect.log("Initializing database")\n\n    const parentSpan = yield* Effect.currentParentSpan\n    yield* Console.log(parentSpan.spanId) // "42"\n\n    return {\n      query: (sql: string) => Effect.succeed(`Result: ${sql}`)\n    }\n  })\n).pipe(Layer.provide(Layer.parentSpan(Tracer.externalSpan({\n  spanId: "42",\n  traceId: "000"\n}))))';
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
