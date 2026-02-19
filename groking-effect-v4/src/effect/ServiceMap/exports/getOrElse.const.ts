/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ServiceMap
 * Export: getOrElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ServiceMap.ts
 * Generated: 2026-02-19T04:14:20.377Z
 *
 * Overview:
 * Get a service from the context that corresponds to the given key, or use the fallback value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ServiceMap } from "effect"
 * import * as assert from "node:assert"
 * 
 * const Logger = ServiceMap.Service<{ log: (msg: string) => void }>("Logger")
 * const Database = ServiceMap.Service<{ query: (sql: string) => string }>(
 *   "Database"
 * )
 * 
 * const services = ServiceMap.make(Logger, {
 *   log: (msg: string) => console.log(msg)
 * })
 * 
 * const logger = ServiceMap.getOrElse(services, Logger, () => ({ log: () => {} }))
 * const database = ServiceMap.getOrElse(
 *   services,
 *   Database,
 *   () => ({ query: () => "fallback" })
 * )
 * 
 * assert.deepStrictEqual(logger, { log: (msg: string) => console.log(msg) })
 * assert.deepStrictEqual(database, { query: () => "fallback" })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ServiceMapModule from "effect/ServiceMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getOrElse";
const exportKind = "const";
const moduleImportPath = "effect/ServiceMap";
const sourceSummary = "Get a service from the context that corresponds to the given key, or use the fallback value.";
const sourceExample = "import { ServiceMap } from \"effect\"\nimport * as assert from \"node:assert\"\n\nconst Logger = ServiceMap.Service<{ log: (msg: string) => void }>(\"Logger\")\nconst Database = ServiceMap.Service<{ query: (sql: string) => string }>(\n  \"Database\"\n)\n\nconst services = ServiceMap.make(Logger, {\n  log: (msg: string) => console.log(msg)\n})\n\nconst logger = ServiceMap.getOrElse(services, Logger, () => ({ log: () => {} }))\nconst database = ServiceMap.getOrElse(\n  services,\n  Database,\n  () => ({ query: () => \"fallback\" })\n)\n\nassert.deepStrictEqual(logger, { log: (msg: string) => console.log(msg) })\nassert.deepStrictEqual(database, { query: () => \"fallback\" })";
const moduleRecord = ServiceMapModule as Record<string, unknown>;

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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
