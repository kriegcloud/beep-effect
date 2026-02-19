/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: service
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Accesses a service from the context.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, ServiceMap } from "effect"
 * 
 * interface Database {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }
 * 
 * const Database = ServiceMap.Service<Database>("Database")
 * 
 * const program = Effect.gen(function*() {
 *   const db = yield* Effect.service(Database)
 *   return yield* db.query("SELECT * FROM users")
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "service";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Accesses a service from the context.";
const sourceExample = "import { Effect, ServiceMap } from \"effect\"\n\ninterface Database {\n  readonly query: (sql: string) => Effect.Effect<string>\n}\n\nconst Database = ServiceMap.Service<Database>(\"Database\")\n\nconst program = Effect.gen(function*() {\n  const db = yield* Effect.service(Database)\n  return yield* db.query(\"SELECT * FROM users\")\n})";
const moduleRecord = EffectModule as Record<string, unknown>;

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
