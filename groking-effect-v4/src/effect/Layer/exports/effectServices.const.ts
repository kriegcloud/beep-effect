/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: effectServices
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:50:37.314Z
 *
 * Overview:
 * Constructs a layer from the specified scoped effect, which must return one or more services.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 *
 * class Database extends ServiceMap.Service<
 *   Database,
 *   { readonly query: (sql: string) => Effect.Effect<string> }
 * >()("Database") {}
 *
 * const layer = Layer.effectServices(
 *   Effect.succeed(ServiceMap.make(Database, {
 *     query: (sql: string) => Effect.succeed(`Query: ${sql}`)
 *   }))
 * )
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
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "effectServices";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Constructs a layer from the specified scoped effect, which must return one or more services.";
const sourceExample =
  'import { Effect, Layer, ServiceMap } from "effect"\n\nclass Database extends ServiceMap.Service<\n  Database,\n  { readonly query: (sql: string) => Effect.Effect<string> }\n>()("Database") {}\n\nconst layer = Layer.effectServices(\n  Effect.succeed(ServiceMap.make(Database, {\n    query: (sql: string) => Effect.succeed(`Query: ${sql}`)\n  }))\n)';
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
