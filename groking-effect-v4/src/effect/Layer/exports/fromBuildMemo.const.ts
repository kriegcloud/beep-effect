/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: fromBuildMemo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.317Z
 *
 * Overview:
 * Constructs a Layer from a function that uses a `MemoMap` and `Scope` to build the layer, with automatic memoization.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, ServiceMap } from "effect"
 * 
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 * 
 * const databaseLayer = Layer.fromBuildMemo(() =>
 *   Effect.sync(() =>
 *     ServiceMap.make(Database, {
 *       query: (sql: string) => Effect.succeed("result")
 *     })
 *   )
 * )
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
import * as LayerModule from "effect/Layer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromBuildMemo";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Constructs a Layer from a function that uses a `MemoMap` and `Scope` to build the layer, with automatic memoization.";
const sourceExample = "import { Effect, Layer, ServiceMap } from \"effect\"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()(\"Database\") {}\n\nconst databaseLayer = Layer.fromBuildMemo(() =>\n  Effect.sync(() =>\n    ServiceMap.make(Database, {\n      query: (sql: string) => Effect.succeed(\"result\")\n    })\n  )\n)";
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
