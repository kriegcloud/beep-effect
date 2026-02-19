/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: provideServices
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.913Z
 *
 * Overview:
 * Provides a service map to an effect, fulfilling its service requirements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, ServiceMap } from "effect"
 *
 * // Define service keys
 * const Logger = ServiceMap.Service<{
 *   log: (msg: string) => void
 * }>("Logger")
 * const Database = ServiceMap.Service<{
 *   query: (sql: string) => string
 * }>("Database")
 *
 * // Create service map with multiple services
 * const serviceMap = ServiceMap.make(Logger, { log: console.log })
 *   .pipe(ServiceMap.add(Database, { query: () => "result" }))
 *
 * // An effect that requires both services
 * const program = Effect.gen(function*() {
 *   const logger = yield* Effect.service(Logger)
 *   const db = yield* Effect.service(Database)
 *   logger.log("Querying database")
 *   return db.query("SELECT * FROM users")
 * })
 *
 * const provided = Effect.provideServices(program, serviceMap)
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "provideServices";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Provides a service map to an effect, fulfilling its service requirements.";
const sourceExample =
  'import { Effect, ServiceMap } from "effect"\n\n// Define service keys\nconst Logger = ServiceMap.Service<{\n  log: (msg: string) => void\n}>("Logger")\nconst Database = ServiceMap.Service<{\n  query: (sql: string) => string\n}>("Database")\n\n// Create service map with multiple services\nconst serviceMap = ServiceMap.make(Logger, { log: console.log })\n  .pipe(ServiceMap.add(Database, { query: () => "result" }))\n\n// An effect that requires both services\nconst program = Effect.gen(function*() {\n  const logger = yield* Effect.service(Logger)\n  const db = yield* Effect.service(Database)\n  logger.log("Querying database")\n  return db.query("SELECT * FROM users")\n})\n\nconst provided = Effect.provideServices(program, serviceMap)';
const moduleRecord = EffectModule as Record<string, unknown>;

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
