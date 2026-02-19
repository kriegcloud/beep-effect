/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runPromiseExitWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * Runs an effect and returns a Promise of Exit with provided services.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, ServiceMap } from "effect"
 * 
 * interface Database {
 *   query: (sql: string) => string
 * }
 * 
 * const Database = ServiceMap.Service<Database>("Database")
 * 
 * const services = ServiceMap.make(Database, {
 *   query: (sql) => `Result for: ${sql}`
 * })
 * 
 * const program = Effect.gen(function*() {
 *   const db = yield* Database
 *   return db.query("SELECT * FROM users")
 * })
 * 
 * Effect.runPromiseExitWith(services)(program).then((exit) => {
 *   if (Exit.isSuccess(exit)) {
 *     console.log("Success:", exit.value)
 *   }
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
const exportName = "runPromiseExitWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Runs an effect and returns a Promise of Exit with provided services.";
const sourceExample = "import { Effect, Exit, ServiceMap } from \"effect\"\n\ninterface Database {\n  query: (sql: string) => string\n}\n\nconst Database = ServiceMap.Service<Database>(\"Database\")\n\nconst services = ServiceMap.make(Database, {\n  query: (sql) => `Result for: ${sql}`\n})\n\nconst program = Effect.gen(function*() {\n  const db = yield* Database\n  return db.query(\"SELECT * FROM users\")\n})\n\nEffect.runPromiseExitWith(services)(program).then((exit) => {\n  if (Exit.isSuccess(exit)) {\n    console.log(\"Success:\", exit.value)\n  }\n})";
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
