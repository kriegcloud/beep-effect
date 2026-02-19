/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: services
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.915Z
 *
 * Overview:
 * Returns the complete service map from the current context.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Option, ServiceMap } from "effect"
 *
 * const Logger = ServiceMap.Service<{
 *   log: (msg: string) => void
 * }>("Logger")
 * const Database = ServiceMap.Service<{
 *   query: (sql: string) => string
 * }>("Database")
 *
 * const program = Effect.gen(function*() {
 *   const allServices = yield* Effect.services()
 *
 *   // Check if specific services are available
 *   const loggerOption = ServiceMap.getOption(allServices, Logger)
 *   const databaseOption = ServiceMap.getOption(allServices, Database)
 *
 *   yield* Console.log(`Logger available: ${Option.isSome(loggerOption)}`)
 *   yield* Console.log(`Database available: ${Option.isSome(databaseOption)}`)
 * })
 *
 * const serviceMap = ServiceMap.make(Logger, { log: console.log })
 *   .pipe(ServiceMap.add(Database, { query: () => "result" }))
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
const exportName = "services";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Returns the complete service map from the current context.";
const sourceExample =
  'import { Console, Effect, Option, ServiceMap } from "effect"\n\nconst Logger = ServiceMap.Service<{\n  log: (msg: string) => void\n}>("Logger")\nconst Database = ServiceMap.Service<{\n  query: (sql: string) => string\n}>("Database")\n\nconst program = Effect.gen(function*() {\n  const allServices = yield* Effect.services()\n\n  // Check if specific services are available\n  const loggerOption = ServiceMap.getOption(allServices, Logger)\n  const databaseOption = ServiceMap.getOption(allServices, Database)\n\n  yield* Console.log(`Logger available: ${Option.isSome(loggerOption)}`)\n  yield* Console.log(`Database available: ${Option.isSome(databaseOption)}`)\n})\n\nconst serviceMap = ServiceMap.make(Logger, { log: console.log })\n  .pipe(ServiceMap.add(Database, { query: () => "result" }))\n\nconst provided = Effect.provideServices(program, serviceMap)';
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
