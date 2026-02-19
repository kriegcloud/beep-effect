/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/IdGenerator
 * Export: Service
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/IdGenerator.ts
 * Generated: 2026-02-19T04:50:45.187Z
 *
 * Overview:
 * The service interface for ID generation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import type { IdGenerator } from "effect/unstable/ai"
 *
 * // Custom implementation
 * const customService: IdGenerator.Service = {
 *   generateId: () => Effect.succeed(`custom_${Date.now()}`)
 * }
 *
 * const program = Effect.gen(function*() {
 *   const id = yield* customService.generateId()
 *   console.log(id) // "custom_1234567890"
 *   return id
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as IdGeneratorModule from "effect/unstable/ai/IdGenerator";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Service";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/IdGenerator";
const sourceSummary = "The service interface for ID generation.";
const sourceExample =
  'import { Effect } from "effect"\nimport type { IdGenerator } from "effect/unstable/ai"\n\n// Custom implementation\nconst customService: IdGenerator.Service = {\n  generateId: () => Effect.succeed(`custom_${Date.now()}`)\n}\n\nconst program = Effect.gen(function*() {\n  const id = yield* customService.generateId()\n  console.log(id) // "custom_1234567890"\n  return id\n})';
const moduleRecord = IdGeneratorModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
