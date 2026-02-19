/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: toFile
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * Create a Logger from another string Logger that writes to the specified file.
 *
 * Source JSDoc Example:
 * ```ts
 * import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
 * import { Effect, Layer, Logger } from "effect"
 *
 * const fileLogger = Logger.formatJson.pipe(
 *   Logger.toFile("/tmp/log.txt")
 * )
 * const LoggerLive = Logger.layer([fileLogger]).pipe(
 *   Layer.provide(NodeFileSystem.layer)
 * )
 *
 * Effect.log("a").pipe(
 *   Effect.andThen(Effect.log("b")),
 *   Effect.andThen(Effect.log("c")),
 *   Effect.provide(LoggerLive),
 *   NodeRuntime.runMain
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
import * as LoggerModule from "effect/Logger";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toFile";
const exportKind = "const";
const moduleImportPath = "effect/Logger";
const sourceSummary = "Create a Logger from another string Logger that writes to the specified file.";
const sourceExample =
  'import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"\nimport { Effect, Layer, Logger } from "effect"\n\nconst fileLogger = Logger.formatJson.pipe(\n  Logger.toFile("/tmp/log.txt")\n)\nconst LoggerLive = Logger.layer([fileLogger]).pipe(\n  Layer.provide(NodeFileSystem.layer)\n)\n\nEffect.log("a").pipe(\n  Effect.andThen(Effect.log("b")),\n  Effect.andThen(Effect.log("c")),\n  Effect.provide(LoggerLive),\n  NodeRuntime.runMain\n)';
const moduleRecord = LoggerModule as Record<string, unknown>;

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
