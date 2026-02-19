/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/IdGenerator
 * Export: defaultIdGenerator
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/IdGenerator.ts
 * Generated: 2026-02-19T04:14:23.883Z
 *
 * Overview:
 * Default ID generator service implementation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const id = yield* IdGenerator.defaultIdGenerator.generateId()
 *   console.log(id) // "id_A7xK9mP2qR5tY8uV"
 *   return id
 * })
 *
 * // Or provide it as a service
 * const withDefault = program.pipe(
 *   Effect.provideService(
 *     IdGenerator.IdGenerator,
 *     IdGenerator.defaultIdGenerator
 *   )
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as IdGeneratorModule from "effect/unstable/ai/IdGenerator";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "defaultIdGenerator";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/IdGenerator";
const sourceSummary = "Default ID generator service implementation.";
const sourceExample =
  'import { Effect } from "effect"\nimport { IdGenerator } from "effect/unstable/ai"\n\nconst program = Effect.gen(function*() {\n  const id = yield* IdGenerator.defaultIdGenerator.generateId()\n  console.log(id) // "id_A7xK9mP2qR5tY8uV"\n  return id\n})\n\n// Or provide it as a service\nconst withDefault = program.pipe(\n  Effect.provideService(\n    IdGenerator.IdGenerator,\n    IdGenerator.defaultIdGenerator\n  )\n)';
const moduleRecord = IdGeneratorModule as Record<string, unknown>;

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
