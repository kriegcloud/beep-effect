/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: FileSystem
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:50:36.445Z
 *
 * Overview:
 * Core interface for file system operations in Effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Basic file operations
 *   const exists = yield* fs.exists("./config.json")
 *   if (!exists) {
 *     yield* fs.writeFileString("./config.json", "{\"env\": \"development\"}")
 *   }
 *
 *   // Directory operations
 *   yield* fs.makeDirectory("./logs", { recursive: true })
 *
 *   // File information
 *   const stats = yield* fs.stat("./config.json")
 *   yield* Console.log(`File size: ${stats.size} bytes`)
 *
 *   // Streaming operations
 *   const content = yield* fs.readFileString("./config.json")
 *   yield* Console.log("Config:", content)
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
import * as FileSystemModule from "effect/FileSystem";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FileSystem";
const exportKind = "interface";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Core interface for file system operations in Effect.";
const sourceExample =
  'import { Console, Effect, FileSystem } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n\n  // Basic file operations\n  const exists = yield* fs.exists("./config.json")\n  if (!exists) {\n    yield* fs.writeFileString("./config.json", "{\\"env\\": \\"development\\"}")\n  }\n\n  // Directory operations\n  yield* fs.makeDirectory("./logs", { recursive: true })\n\n  // File information\n  const stats = yield* fs.stat("./config.json")\n  yield* Console.log(`File size: ${stats.size} bytes`)\n\n  // Streaming operations\n  const content = yield* fs.readFileString("./config.json")\n  yield* Console.log("Config:", content)\n})';
const moduleRecord = FileSystemModule as Record<string, unknown>;

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
