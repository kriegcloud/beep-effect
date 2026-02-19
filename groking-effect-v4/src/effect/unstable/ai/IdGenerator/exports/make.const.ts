/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/IdGenerator
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/IdGenerator.ts
 * Generated: 2026-02-19T04:50:45.187Z
 *
 * Overview:
 * Creates a custom ID generator service with the specified options.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   // Create a generator for AI assistant message IDs
 *   const messageIdGen = yield* IdGenerator.make({
 *     alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
 *     prefix: "msg",
 *     separator: "-",
 *     size: 10
 *   })
 *
 *   const messageId = yield* messageIdGen.generateId()
 *   console.log(messageId) // "msg-A7X9K2M5P8"
 *   return messageId
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as IdGeneratorModule from "effect/unstable/ai/IdGenerator";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/IdGenerator";
const sourceSummary = "Creates a custom ID generator service with the specified options.";
const sourceExample =
  'import { Effect } from "effect"\nimport { IdGenerator } from "effect/unstable/ai"\n\nconst program = Effect.gen(function*() {\n  // Create a generator for AI assistant message IDs\n  const messageIdGen = yield* IdGenerator.make({\n    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",\n    prefix: "msg",\n    separator: "-",\n    size: 10\n  })\n\n  const messageId = yield* messageIdGen.generateId()\n  console.log(messageId) // "msg-A7X9K2M5P8"\n  return messageId\n})';
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
