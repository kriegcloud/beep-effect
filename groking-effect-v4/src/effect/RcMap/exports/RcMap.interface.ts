/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcMap
 * Export: RcMap
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/RcMap.ts
 * Generated: 2026-02-19T04:50:38.592Z
 *
 * Overview:
 * An `RcMap` is a reference-counted map data structure that manages the lifecycle of resources indexed by keys. Resources are lazily acquired and automatically released when no longer in use.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, RcMap } from "effect"
 *
 * Effect.gen(function*() {
 *   // Create an RcMap that manages database connections
 *   const dbConnectionMap = yield* RcMap.make({
 *     lookup: (dbName: string) =>
 *       Effect.acquireRelease(
 *         Effect.succeed(`Connection to ${dbName}`),
 *         (conn) => Effect.log(`Closing ${conn}`)
 *       ),
 *     capacity: 10,
 *     idleTimeToLive: "5 minutes"
 *   })
 *
 *   // The RcMap interface provides access to:
 *   // - lookup: Function to acquire resources
 *   // - capacity: Maximum number of resources
 *   // - idleTimeToLive: Time before idle resources are released
 *   // - state: Current state of the map
 *
 *   console.log(`Capacity: ${dbConnectionMap.capacity}`)
 * }).pipe(Effect.scoped)
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
import * as RcMapModule from "effect/RcMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "RcMap";
const exportKind = "interface";
const moduleImportPath = "effect/RcMap";
const sourceSummary =
  "An `RcMap` is a reference-counted map data structure that manages the lifecycle of resources indexed by keys. Resources are lazily acquired and automatically released when no lo...";
const sourceExample =
  'import { Effect, RcMap } from "effect"\n\nEffect.gen(function*() {\n  // Create an RcMap that manages database connections\n  const dbConnectionMap = yield* RcMap.make({\n    lookup: (dbName: string) =>\n      Effect.acquireRelease(\n        Effect.succeed(`Connection to ${dbName}`),\n        (conn) => Effect.log(`Closing ${conn}`)\n      ),\n    capacity: 10,\n    idleTimeToLive: "5 minutes"\n  })\n\n  // The RcMap interface provides access to:\n  // - lookup: Function to acquire resources\n  // - capacity: Maximum number of resources\n  // - idleTimeToLive: Time before idle resources are released\n  // - state: Current state of the map\n\n  console.log(`Capacity: ${dbConnectionMap.capacity}`)\n}).pipe(Effect.scoped)';
const moduleRecord = RcMapModule as Record<string, unknown>;

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
