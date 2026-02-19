/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: build
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.317Z
 *
 * Overview:
 * Builds a layer into a scoped value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 *
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Build a layer to get its services
 * const program = Effect.gen(function*() {
 *   const dbLayer = Layer.succeed(Database)({
 *     query: (sql: string) => Effect.succeed("result")
 *   })
 *
 *   // Build the layer into ServiceMap - automatically manages scope and memoization
 *   const services = yield* Layer.build(dbLayer)
 *
 *   // Extract the specific service from the built layer
 *   const database = ServiceMap.get(services, Database)
 *
 *   return yield* database.query("SELECT * FROM users")
 * })
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "build";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Builds a layer into a scoped value.";
const sourceExample =
  'import { Effect, Layer, ServiceMap } from "effect"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()("Database") {}\n\n// Build a layer to get its services\nconst program = Effect.gen(function*() {\n  const dbLayer = Layer.succeed(Database)({\n    query: (sql: string) => Effect.succeed("result")\n  })\n\n  // Build the layer into ServiceMap - automatically manages scope and memoization\n  const services = yield* Layer.build(dbLayer)\n\n  // Extract the specific service from the built layer\n  const database = ServiceMap.get(services, Database)\n\n  return yield* database.query("SELECT * FROM users")\n})';
const moduleRecord = LayerModule as Record<string, unknown>;

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
