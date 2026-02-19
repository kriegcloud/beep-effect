/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ServiceMap
 * Export: ServiceMap
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/ServiceMap.ts
 * Generated: 2026-02-19T04:14:20.377Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ServiceMap } from "effect"
 * 
 * // Create a service map with multiple services
 * const Logger = ServiceMap.Service<{ log: (msg: string) => void }>("Logger")
 * const Database = ServiceMap.Service<{ query: (sql: string) => string }>(
 *   "Database"
 * )
 * 
 * const services = ServiceMap.make(Logger, {
 *   log: (msg: string) => console.log(msg)
 * })
 *   .pipe(ServiceMap.add(Database, { query: (sql) => `Result: ${sql}` }))
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ServiceMapModule from "effect/ServiceMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ServiceMap";
const exportKind = "interface";
const moduleImportPath = "effect/ServiceMap";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample = "import { ServiceMap } from \"effect\"\n\n// Create a service map with multiple services\nconst Logger = ServiceMap.Service<{ log: (msg: string) => void }>(\"Logger\")\nconst Database = ServiceMap.Service<{ query: (sql: string) => string }>(\n  \"Database\"\n)\n\nconst services = ServiceMap.make(Logger, {\n  log: (msg: string) => console.log(msg)\n})\n  .pipe(ServiceMap.add(Database, { query: (sql) => `Result: ${sql}` }))";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
