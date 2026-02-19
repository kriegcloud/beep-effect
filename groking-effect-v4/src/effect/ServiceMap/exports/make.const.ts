/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ServiceMap
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ServiceMap.ts
 * Generated: 2026-02-19T04:14:20.377Z
 *
 * Overview:
 * Creates a new `ServiceMap` with a single service associated to the key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ServiceMap } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = ServiceMap.Service<{ PORT: number }>("Port")
 *
 * const Services = ServiceMap.make(Port, { PORT: 8080 })
 *
 * assert.deepStrictEqual(ServiceMap.get(Services, Port), { PORT: 8080 })
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/ServiceMap";
const sourceSummary = "Creates a new `ServiceMap` with a single service associated to the key.";
const sourceExample =
  'import { ServiceMap } from "effect"\nimport * as assert from "node:assert"\n\nconst Port = ServiceMap.Service<{ PORT: number }>("Port")\n\nconst Services = ServiceMap.make(Port, { PORT: 8080 })\n\nassert.deepStrictEqual(ServiceMap.get(Services, Port), { PORT: 8080 })';
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
