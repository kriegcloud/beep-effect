/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: acquireUseRelease
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.906Z
 *
 * Overview:
 * This function is used to ensure that an `Effect` value that represents the acquisition of a resource (for example, opening a file, launching a thread, etc.) will not be interrupted, and that the resource will always be released when the `Effect` value completes execution.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit } from "effect"
 *
 * interface Database {
 *   readonly connection: string
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }
 *
 * const program = Effect.acquireUseRelease(
 *   // Acquire - connect to database
 *   Effect.gen(function*() {
 *     yield* Console.log("Connecting to database...")
 *     return {
 *       connection: "db://localhost:5432",
 *       query: (sql: string) => Effect.succeed(`Result for: ${sql}`)
 *     }
 *   }),
 *   // Use - perform database operations
 *   (db) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Connected to ${db.connection}`)
 *       const result = yield* db.query("SELECT * FROM users")
 *       yield* Console.log(`Query result: ${result}`)
 *       return result
 *     }),
 *   // Release - close database connection
 *   (db, exit) =>
 *     Effect.gen(function*() {
 *       if (Exit.isSuccess(exit)) {
 *         yield* Console.log(`Closing connection to ${db.connection} (success)`)
 *       } else {
 *         yield* Console.log(`Closing connection to ${db.connection} (failure)`)
 *       }
 *     })
 * )
 *
 * Effect.runPromise(program)
 * // Output:
 * // Connecting to database...
 * // Connected to db://localhost:5432
 * // Query result: Result for: SELECT * FROM users
 * // Closing connection to db://localhost:5432 (success)
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
const exportName = "acquireUseRelease";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "This function is used to ensure that an `Effect` value that represents the acquisition of a resource (for example, opening a file, launching a thread, etc.) will not be interrup...";
const sourceExample =
  'import { Console, Effect, Exit } from "effect"\n\ninterface Database {\n  readonly connection: string\n  readonly query: (sql: string) => Effect.Effect<string>\n}\n\nconst program = Effect.acquireUseRelease(\n  // Acquire - connect to database\n  Effect.gen(function*() {\n    yield* Console.log("Connecting to database...")\n    return {\n      connection: "db://localhost:5432",\n      query: (sql: string) => Effect.succeed(`Result for: ${sql}`)\n    }\n  }),\n  // Use - perform database operations\n  (db) =>\n    Effect.gen(function*() {\n      yield* Console.log(`Connected to ${db.connection}`)\n      const result = yield* db.query("SELECT * FROM users")\n      yield* Console.log(`Query result: ${result}`)\n      return result\n    }),\n  // Release - close database connection\n  (db, exit) =>\n    Effect.gen(function*() {\n      if (Exit.isSuccess(exit)) {\n        yield* Console.log(`Closing connection to ${db.connection} (success)`)\n      } else {\n        yield* Console.log(`Closing connection to ${db.connection} (failure)`)\n      }\n    })\n)\n\nEffect.runPromise(program)\n// Output:\n// Connecting to database...\n// Connected to db://localhost:5432\n// Query result: Result for: SELECT * FROM users\n// Closing connection to db://localhost:5432 (success)';
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
