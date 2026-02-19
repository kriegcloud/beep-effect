/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: provide
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.912Z
 *
 * Overview:
 * Provides dependencies to an effect using layers or a context. Use `options.local` to build the layer every time; by default, layers are shared between provide calls.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 *
 * interface Database {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }
 *
 * const Database = ServiceMap.Service<Database>("Database")
 *
 * const DatabaseLive = Layer.succeed(Database)({
 *   query: (sql: string) => Effect.succeed(`Result for: ${sql}`)
 * })
 *
 * const program = Effect.gen(function*() {
 *   const db = yield* Database
 *   return yield* db.query("SELECT * FROM users")
 * })
 *
 * const provided = Effect.provide(program, DatabaseLive)
 *
 * Effect.runPromise(provided).then(console.log)
 * // Output: "Result for: SELECT * FROM users"
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
const exportName = "provide";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Provides dependencies to an effect using layers or a context. Use `options.local` to build the layer every time; by default, layers are shared between provide calls.";
const sourceExample =
  'import { Effect, Layer, ServiceMap } from "effect"\n\ninterface Database {\n  readonly query: (sql: string) => Effect.Effect<string>\n}\n\nconst Database = ServiceMap.Service<Database>("Database")\n\nconst DatabaseLive = Layer.succeed(Database)({\n  query: (sql: string) => Effect.succeed(`Result for: ${sql}`)\n})\n\nconst program = Effect.gen(function*() {\n  const db = yield* Database\n  return yield* db.query("SELECT * FROM users")\n})\n\nconst provided = Effect.provide(program, DatabaseLive)\n\nEffect.runPromise(provided).then(console.log)\n// Output: "Result for: SELECT * FROM users"';
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
