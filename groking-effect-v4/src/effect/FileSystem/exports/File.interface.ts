/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: File
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:14:13.236Z
 *
 * Overview:
 * Interface representing an open file handle.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Open a file and work with the handle
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const file = yield* fs.open("./data.txt", { flag: "r+" })
 *
 *       // Get file information
 *       const stats = yield* file.stat
 *       yield* Console.log(`File size: ${stats.size} bytes`)
 *
 *       // Read from specific position
 *       yield* file.seek(10, "start")
 *       const buffer = new Uint8Array(5)
 *       const bytesRead = yield* file.read(buffer)
 *       yield* Console.log(`Read ${bytesRead} bytes:`, buffer)
 *
 *       // Write data
 *       const data = new TextEncoder().encode("Hello")
 *       yield* file.write(data)
 *       yield* file.sync // Flush to disk
 *     })
 *   )
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystemModule from "effect/FileSystem";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "File";
const exportKind = "interface";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Interface representing an open file handle.";
const sourceExample =
  'import { Console, Effect, FileSystem } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n\n  // Open a file and work with the handle\n  yield* Effect.scoped(\n    Effect.gen(function*() {\n      const file = yield* fs.open("./data.txt", { flag: "r+" })\n\n      // Get file information\n      const stats = yield* file.stat\n      yield* Console.log(`File size: ${stats.size} bytes`)\n\n      // Read from specific position\n      yield* file.seek(10, "start")\n      const buffer = new Uint8Array(5)\n      const bytesRead = yield* file.read(buffer)\n      yield* Console.log(`Read ${bytesRead} bytes:`, buffer)\n\n      // Write data\n      const data = new TextEncoder().encode("Hello")\n      yield* file.write(data)\n      yield* file.sync // Flush to disk\n    })\n  )\n})';
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
  bunContext: BunContext,
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
