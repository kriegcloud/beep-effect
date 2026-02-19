/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: orDie
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.318Z
 *
 * Overview:
 * Translates effect failure into death of the fiber, making all failures unchecked and not a part of the type of the layer.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, Layer, ServiceMap } from "effect"
 *
 * class DatabaseError extends Data.TaggedError("DatabaseError")<{
 *   message: string
 * }> {}
 *
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Layer that can fail during construction
 * const flakyDatabaseLayer = Layer.effect(Database)(Effect.gen(function*() {
 *   // Simulate a database connection that might fail
 *   const shouldFail = Math.random() > 0.5
 *   if (shouldFail) {
 *     yield* Effect.fail(new DatabaseError({ message: "Connection failed" }))
 *   }
 *
 *   return { query: (sql: string) => Effect.succeed(`Result: ${sql}`) }
 * }))
 *
 * // Convert failures to fiber death - removes error from type
 * const reliableDatabaseLayer = flakyDatabaseLayer.pipe(Layer.orDie)
 *
 * // Now the layer type is Layer<Database, never, never> - no error in type
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   return yield* database.query("SELECT * FROM users")
 * }).pipe(
 *   Effect.provide(reliableDatabaseLayer)
 * )
 *
 * // If the database layer fails, the entire fiber will die
 * // instead of the effect failing with DatabaseError
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
const exportName = "orDie";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary =
  "Translates effect failure into death of the fiber, making all failures unchecked and not a part of the type of the layer.";
const sourceExample =
  'import { Data, Effect, Layer, ServiceMap } from "effect"\n\nclass DatabaseError extends Data.TaggedError("DatabaseError")<{\n  message: string\n}> {}\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()("Database") {}\n\n// Layer that can fail during construction\nconst flakyDatabaseLayer = Layer.effect(Database)(Effect.gen(function*() {\n  // Simulate a database connection that might fail\n  const shouldFail = Math.random() > 0.5\n  if (shouldFail) {\n    yield* Effect.fail(new DatabaseError({ message: "Connection failed" }))\n  }\n\n  return { query: (sql: string) => Effect.succeed(`Result: ${sql}`) }\n}))\n\n// Convert failures to fiber death - removes error from type\nconst reliableDatabaseLayer = flakyDatabaseLayer.pipe(Layer.orDie)\n\n// Now the layer type is Layer<Database, never, never> - no error in type\nconst program = Effect.gen(function*() {\n  const database = yield* Database\n  return yield* database.query("SELECT * FROM users")\n}).pipe(\n  Effect.provide(reliableDatabaseLayer)\n)\n\n// If the database layer fails, the entire fiber will die\n// instead of the effect failing with DatabaseError';
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
