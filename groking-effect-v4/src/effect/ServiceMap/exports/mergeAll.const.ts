/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ServiceMap
 * Export: mergeAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ServiceMap.ts
 * Generated: 2026-02-19T04:14:20.377Z
 *
 * Overview:
 * Merges any number of `ServiceMap`s, returning a new `ServiceMap` containing the services of all.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ServiceMap } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = ServiceMap.Service<{ PORT: number }>("Port")
 * const Timeout = ServiceMap.Service<{ TIMEOUT: number }>("Timeout")
 * const Host = ServiceMap.Service<{ HOST: string }>("Host")
 *
 * const firstServiceMap = ServiceMap.make(Port, { PORT: 8080 })
 * const secondServiceMap = ServiceMap.make(Timeout, { TIMEOUT: 5000 })
 * const thirdServiceMap = ServiceMap.make(Host, { HOST: "localhost" })
 *
 * const Services = ServiceMap.mergeAll(
 *   firstServiceMap,
 *   secondServiceMap,
 *   thirdServiceMap
 * )
 *
 * assert.deepStrictEqual(ServiceMap.get(Services, Port), { PORT: 8080 })
 * assert.deepStrictEqual(ServiceMap.get(Services, Timeout), { TIMEOUT: 5000 })
 * assert.deepStrictEqual(ServiceMap.get(Services, Host), { HOST: "localhost" })
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
import * as ServiceMapModule from "effect/ServiceMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mergeAll";
const exportKind = "const";
const moduleImportPath = "effect/ServiceMap";
const sourceSummary =
  "Merges any number of `ServiceMap`s, returning a new `ServiceMap` containing the services of all.";
const sourceExample =
  'import { ServiceMap } from "effect"\nimport * as assert from "node:assert"\n\nconst Port = ServiceMap.Service<{ PORT: number }>("Port")\nconst Timeout = ServiceMap.Service<{ TIMEOUT: number }>("Timeout")\nconst Host = ServiceMap.Service<{ HOST: string }>("Host")\n\nconst firstServiceMap = ServiceMap.make(Port, { PORT: 8080 })\nconst secondServiceMap = ServiceMap.make(Timeout, { TIMEOUT: 5000 })\nconst thirdServiceMap = ServiceMap.make(Host, { HOST: "localhost" })\n\nconst Services = ServiceMap.mergeAll(\n  firstServiceMap,\n  secondServiceMap,\n  thirdServiceMap\n)\n\nassert.deepStrictEqual(ServiceMap.get(Services, Port), { PORT: 8080 })\nassert.deepStrictEqual(ServiceMap.get(Services, Timeout), { TIMEOUT: 5000 })\nassert.deepStrictEqual(ServiceMap.get(Services, Host), { HOST: "localhost" })';
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
