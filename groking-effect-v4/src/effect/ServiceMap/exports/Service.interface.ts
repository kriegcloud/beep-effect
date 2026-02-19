/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ServiceMap
 * Export: Service
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/ServiceMap.ts
 * Generated: 2026-02-19T04:50:40.842Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ServiceMap } from "effect"
 *
 * // Define an identifier for a database service
 * const Database = ServiceMap.Service<{ query: (sql: string) => string }>(
 *   "Database"
 * )
 *
 * // The key can be used to store and retrieve services
 * const services = ServiceMap.make(Database, { query: (sql) => `Result: ${sql}` })
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
import * as ServiceMapModule from "effect/ServiceMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Service";
const exportKind = "interface";
const moduleImportPath = "effect/ServiceMap";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { ServiceMap } from "effect"\n\n// Define an identifier for a database service\nconst Database = ServiceMap.Service<{ query: (sql: string) => string }>(\n  "Database"\n)\n\n// The key can be used to store and retrieve services\nconst services = ServiceMap.make(Database, { query: (sql) => `Result: ${sql}` })';
const moduleRecord = ServiceMapModule as Record<string, unknown>;

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
