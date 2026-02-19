/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: provideServiceEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.912Z
 *
 * Overview:
 * Provides the effect with the single service it requires. If the effect requires more than one service use `provide` instead.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap } from "effect"
 *
 * // Define a database connection service
 * interface DatabaseConnection {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }
 * const Database = ServiceMap.Service<DatabaseConnection>("Database")
 *
 * // Effect that creates a database connection
 * const createConnection = Effect.gen(function*() {
 *   yield* Console.log("Establishing database connection...")
 *   yield* Effect.sleep("100 millis") // Simulate connection time
 *   yield* Console.log("Database connected!")
 *   return {
 *     query: (sql: string) => Effect.succeed(`Result for: ${sql}`)
 *   }
 * })
 *
 * const program = Effect.gen(function*() {
 *   const db = yield* Effect.service(Database)
 *   return yield* db.query("SELECT * FROM users")
 * })
 *
 * // Provide the service through an effect
 * const withDatabase = Effect.provideServiceEffect(
 *   program,
 *   Database,
 *   createConnection
 * )
 *
 * Effect.runPromise(withDatabase).then(console.log)
 * // Output:
 * // Establishing database connection...
 * // Database connected!
 * // Result for: SELECT * FROM users
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
const exportName = "provideServiceEffect";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Provides the effect with the single service it requires. If the effect requires more than one service use `provide` instead.";
const sourceExample =
  'import { Console, Effect, ServiceMap } from "effect"\n\n// Define a database connection service\ninterface DatabaseConnection {\n  readonly query: (sql: string) => Effect.Effect<string>\n}\nconst Database = ServiceMap.Service<DatabaseConnection>("Database")\n\n// Effect that creates a database connection\nconst createConnection = Effect.gen(function*() {\n  yield* Console.log("Establishing database connection...")\n  yield* Effect.sleep("100 millis") // Simulate connection time\n  yield* Console.log("Database connected!")\n  return {\n    query: (sql: string) => Effect.succeed(`Result for: ${sql}`)\n  }\n})\n\nconst program = Effect.gen(function*() {\n  const db = yield* Effect.service(Database)\n  return yield* db.query("SELECT * FROM users")\n})\n\n// Provide the service through an effect\nconst withDatabase = Effect.provideServiceEffect(\n  program,\n  Database,\n  createConnection\n)\n\nEffect.runPromise(withDatabase).then(console.log)\n// Output:\n// Establishing database connection...\n// Database connected!\n// Result for: SELECT * FROM users';
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
