/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: isLayer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.318Z
 *
 * Overview:
 * Returns `true` if the specified value is a `Layer`, `false` otherwise.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 *
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * const dbLayer = Layer.succeed(Database)({
 *   query: (sql: string) => Effect.succeed("result")
 * })
 * const notALayer = { someProperty: "value" }
 *
 * console.log(Layer.isLayer(dbLayer)) // true
 * console.log(Layer.isLayer(notALayer)) // false
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
const exportName = "isLayer";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Returns `true` if the specified value is a `Layer`, `false` otherwise.";
const sourceExample =
  'import { Effect, Layer, ServiceMap } from "effect"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()("Database") {}\n\nconst dbLayer = Layer.succeed(Database)({\n  query: (sql: string) => Effect.succeed("result")\n})\nconst notALayer = { someProperty: "value" }\n\nconsole.log(Layer.isLayer(dbLayer)) // true\nconsole.log(Layer.isLayer(notALayer)) // false';
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
