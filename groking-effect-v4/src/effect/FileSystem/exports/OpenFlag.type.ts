/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: OpenFlag
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:50:36.446Z
 *
 * Overview:
 * File open flags that determine how a file is opened and what operations are allowed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Open for reading only
 *   const readFile = yield* fs.open("data.txt", { flag: "r" })
 *
 *   // Open for writing, truncating existing content
 *   const writeFile = yield* fs.open("output.txt", { flag: "w" })
 *
 *   // Open for appending
 *   const appendFile = yield* fs.open("log.txt", { flag: "a" })
 *
 *   // Open for read/write, but fail if file doesn't exist
 *   const editFile = yield* fs.open("config.json", { flag: "r+" })
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
const exportName = "OpenFlag";
const exportKind = "type";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "File open flags that determine how a file is opened and what operations are allowed.";
const sourceExample =
  'import { Effect, FileSystem } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n\n  // Open for reading only\n  const readFile = yield* fs.open("data.txt", { flag: "r" })\n\n  // Open for writing, truncating existing content\n  const writeFile = yield* fs.open("output.txt", { flag: "w" })\n\n  // Open for appending\n  const appendFile = yield* fs.open("log.txt", { flag: "a" })\n\n  // Open for read/write, but fail if file doesn\'t exist\n  const editFile = yield* fs.open("config.json", { flag: "r+" })\n})';
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
