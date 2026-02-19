/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: span
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.318Z
 *
 * Overview:
 * Constructs a new `Layer` which creates a span and registers it as the current parent span.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Layer, ServiceMap, type Tracer } from "effect"
 *
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Create a traced layer - all operations performed during construction of
 * // the `Database` service are part of the "database-init" span
 * const databaseLayer = Layer.effect(Database, Effect.gen(function*() {
 *   // These operations are traced under "database-init" span
 *   yield* Effect.log("Connecting to database")
 *   yield* Effect.sleep("100 millis")
 *   yield* Effect.log("Database connected")
 *
 *   const parentSpan = yield* Effect.currentParentSpan
 *   yield* Console.log((parentSpan as Tracer.Span).name) // "database-init"
 *
 *   return {
 *     query: (sql: string) => Effect.succeed(`Result: ${sql}`)
 *   }
 * })).pipe(Layer.provide(Layer.span("database-init")))
 *
 * // Can also use the `onEnd` callback to execute logic when the span ends
 * const tracedLayer = Layer.span("service-initialization", {
 *   attributes: { version: "1.0.0" },
 *   onEnd: (span, exit) =>
 *     Effect.sync(() => {
 *       console.log(`Span ${span.name} ended with:`, exit._tag)
 *     })
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "span";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Constructs a new `Layer` which creates a span and registers it as the current parent span.";
const sourceExample =
  'import { Console, Effect, Layer, ServiceMap, type Tracer } from "effect"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()("Database") {}\n\n// Create a traced layer - all operations performed during construction of\n// the `Database` service are part of the "database-init" span\nconst databaseLayer = Layer.effect(Database, Effect.gen(function*() {\n  // These operations are traced under "database-init" span\n  yield* Effect.log("Connecting to database")\n  yield* Effect.sleep("100 millis")\n  yield* Effect.log("Database connected")\n\n  const parentSpan = yield* Effect.currentParentSpan\n  yield* Console.log((parentSpan as Tracer.Span).name) // "database-init"\n\n  return {\n    query: (sql: string) => Effect.succeed(`Result: ${sql}`)\n  }\n})).pipe(Layer.provide(Layer.span("database-init")))\n\n// Can also use the `onEnd` callback to execute logic when the span ends\nconst tracedLayer = Layer.span("service-initialization", {\n  attributes: { version: "1.0.0" },\n  onEnd: (span, exit) =>\n    Effect.sync(() => {\n      console.log(`Span ${span.name} ended with:`, exit._tag)\n    })\n})';
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
