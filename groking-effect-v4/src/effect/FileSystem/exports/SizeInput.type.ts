/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: SizeInput
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:14:13.237Z
 *
 * Overview:
 * Input type for size parameters that accepts multiple numeric types.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // All of these are valid SizeInput values
 *   yield* fs.truncate("file1.txt", 1024) // number
 *   yield* fs.truncate("file2.txt", BigInt(2048)) // bigint
 *   yield* fs.truncate("file3.txt", FileSystem.Size(4096)) // Size
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
const exportName = "SizeInput";
const exportKind = "type";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Input type for size parameters that accepts multiple numeric types.";
const sourceExample =
  'import { Effect, FileSystem } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n\n  // All of these are valid SizeInput values\n  yield* fs.truncate("file1.txt", 1024) // number\n  yield* fs.truncate("file2.txt", BigInt(2048)) // bigint\n  yield* fs.truncate("file3.txt", FileSystem.Size(4096)) // Size\n})';
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
