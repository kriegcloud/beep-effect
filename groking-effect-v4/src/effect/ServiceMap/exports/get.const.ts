/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ServiceMap
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ServiceMap.ts
 * Generated: 2026-02-19T04:14:20.377Z
 *
 * Overview:
 * Get a service from the context that corresponds to the given key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, ServiceMap } from "effect"
 * import * as assert from "node:assert"
 * 
 * const Port = ServiceMap.Service<{ PORT: number }>("Port")
 * const Timeout = ServiceMap.Service<{ TIMEOUT: number }>("Timeout")
 * 
 * const Services = pipe(
 *   ServiceMap.make(Port, { PORT: 8080 }),
 *   ServiceMap.add(Timeout, { TIMEOUT: 5000 })
 * )
 * 
 * assert.deepStrictEqual(ServiceMap.get(Services, Timeout), { TIMEOUT: 5000 })
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
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/ServiceMap";
const sourceSummary = "Get a service from the context that corresponds to the given key.";
const sourceExample = "import { pipe, ServiceMap } from \"effect\"\nimport * as assert from \"node:assert\"\n\nconst Port = ServiceMap.Service<{ PORT: number }>(\"Port\")\nconst Timeout = ServiceMap.Service<{ TIMEOUT: number }>(\"Timeout\")\n\nconst Services = pipe(\n  ServiceMap.make(Port, { PORT: 8080 }),\n  ServiceMap.add(Timeout, { TIMEOUT: 5000 })\n)\n\nassert.deepStrictEqual(ServiceMap.get(Services, Timeout), { TIMEOUT: 5000 })";
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
