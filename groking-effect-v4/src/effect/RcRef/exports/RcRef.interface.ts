/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcRef
 * Export: RcRef
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/RcRef.ts
 * Generated: 2026-02-19T04:50:38.598Z
 *
 * Overview:
 * A reference counted reference that manages resource lifecycle.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, RcRef } from "effect"
 *
 * // Create an RcRef for a database connection
 * const createConnectionRef = (connectionString: string) =>
 *   RcRef.make({
 *     acquire: Effect.acquireRelease(
 *       Effect.succeed(`Connected to ${connectionString}`),
 *       (connection) => Effect.log(`Closing connection: ${connection}`)
 *     )
 *   })
 *
 * // Use the RcRef in multiple operations
 * const program = Effect.gen(function*() {
 *   const connectionRef = yield* createConnectionRef("postgres://localhost")
 *
 *   // Multiple gets will share the same connection
 *   const connection1 = yield* RcRef.get(connectionRef)
 *   const connection2 = yield* RcRef.get(connectionRef)
 *
 *   return [connection1, connection2]
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RcRefModule from "effect/RcRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "RcRef";
const exportKind = "interface";
const moduleImportPath = "effect/RcRef";
const sourceSummary = "A reference counted reference that manages resource lifecycle.";
const sourceExample =
  'import { Effect, RcRef } from "effect"\n\n// Create an RcRef for a database connection\nconst createConnectionRef = (connectionString: string) =>\n  RcRef.make({\n    acquire: Effect.acquireRelease(\n      Effect.succeed(`Connected to ${connectionString}`),\n      (connection) => Effect.log(`Closing connection: ${connection}`)\n    )\n  })\n\n// Use the RcRef in multiple operations\nconst program = Effect.gen(function*() {\n  const connectionRef = yield* createConnectionRef("postgres://localhost")\n\n  // Multiple gets will share the same connection\n  const connection1 = yield* RcRef.get(connectionRef)\n  const connection2 = yield* RcRef.get(connectionRef)\n\n  return [connection1, connection2]\n})';
const moduleRecord = RcRefModule as Record<string, unknown>;

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
