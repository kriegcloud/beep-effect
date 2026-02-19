/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: buildWithScope
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:14:14.317Z
 *
 * Overview:
 * Builds a layer into an `Effect` value. Any resources associated with this layer will be released when the specified scope is closed unless their scope has been extended. This allows building layers where the lifetime of some of the services output by the layer exceed the lifetime of the effect the layer is provided to.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Layer, Scope, ServiceMap } from "effect"
 * 
 * class Database extends ServiceMap.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 * 
 * // Build a layer with explicit scope control
 * const program = Effect.gen(function*() {
 *   const scope = yield* Effect.scope
 * 
 *   const dbLayer = Layer.effect(Database)(Effect.gen(function*() {
 *     console.log("Initializing database...")
 *     yield* Scope.addFinalizer(
 *       scope,
 *       Effect.sync(() => console.log("Database closed"))
 *     )
 *     return { query: (sql: string) => Effect.succeed(`Result: ${sql}`) }
 *   }))
 * 
 *   // Build with specific scope - resources tied to this scope
 *   const services = yield* Layer.buildWithScope(dbLayer, scope)
 *   const database = ServiceMap.get(services, Database)
 * 
 *   return yield* database.query("SELECT * FROM users")
 *   // Database will be closed when scope is closed
 * })
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
const exportName = "buildWithScope";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Builds a layer into an `Effect` value. Any resources associated with this layer will be released when the specified scope is closed unless their scope has been extended. This al...";
const sourceExample = "import { Effect, Layer, Scope, ServiceMap } from \"effect\"\n\nclass Database extends ServiceMap.Service<Database, {\n  readonly query: (sql: string) => Effect.Effect<string>\n}>()(\"Database\") {}\n\n// Build a layer with explicit scope control\nconst program = Effect.gen(function*() {\n  const scope = yield* Effect.scope\n\n  const dbLayer = Layer.effect(Database)(Effect.gen(function*() {\n    console.log(\"Initializing database...\")\n    yield* Scope.addFinalizer(\n      scope,\n      Effect.sync(() => console.log(\"Database closed\"))\n    )\n    return { query: (sql: string) => Effect.succeed(`Result: ${sql}`) }\n  }))\n\n  // Build with specific scope - resources tied to this scope\n  const services = yield* Layer.buildWithScope(dbLayer, scope)\n  const database = ServiceMap.get(services, Database)\n\n  return yield* database.query(\"SELECT * FROM users\")\n  // Database will be closed when scope is closed\n})";
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
