/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: updateServices
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.396Z
 *
 * Overview:
 * Provides part of the required context while leaving the rest unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, ServiceMap } from "effect"
 *
 * // Define services
 * const Logger = ServiceMap.Service<{
 *   log: (msg: string) => void
 * }>("Logger")
 * const Config = ServiceMap.Service<{
 *   name: string
 * }>("Config")
 *
 * const program = Effect.service(Config).pipe(
 *   Effect.map((config) => `Hello ${config.name}!`)
 * )
 *
 * // Transform services by providing Config while keeping Logger requirement
 * const configured = program.pipe(
 *   Effect.updateServices((services: ServiceMap.ServiceMap<typeof Logger>) =>
 *     ServiceMap.add(services, Config, { name: "World" })
 *   )
 * )
 *
 * // The effect now requires only Logger service
 * const result = Effect.provideService(configured, Logger, {
 *   log: (msg) => console.log(msg)
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "updateServices";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Provides part of the required context while leaving the rest unchanged.";
const sourceExample =
  'import { Effect, ServiceMap } from "effect"\n\n// Define services\nconst Logger = ServiceMap.Service<{\n  log: (msg: string) => void\n}>("Logger")\nconst Config = ServiceMap.Service<{\n  name: string\n}>("Config")\n\nconst program = Effect.service(Config).pipe(\n  Effect.map((config) => `Hello ${config.name}!`)\n)\n\n// Transform services by providing Config while keeping Logger requirement\nconst configured = program.pipe(\n  Effect.updateServices((services: ServiceMap.ServiceMap<typeof Logger>) =>\n    ServiceMap.add(services, Config, { name: "World" })\n  )\n)\n\n// The effect now requires only Logger service\nconst result = Effect.provideService(configured, Logger, {\n  log: (msg) => console.log(msg)\n})';
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
