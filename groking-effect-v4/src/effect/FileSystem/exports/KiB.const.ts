/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: KiB
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:14:13.236Z
 *
 * Overview:
 * Creates a `Size` representing kilobytes (1024 bytes).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Create a 64 KiB buffer size for streaming
 *   const bufferSize = FileSystem.KiB(64)
 *
 *   const stream = fs.stream("large-file.txt", {
 *     chunkSize: bufferSize
 *   })
 *
 *   // Truncate file to 100 KiB
 *   yield* fs.truncate("data.txt", FileSystem.KiB(100))
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
import * as FileSystemModule from "effect/FileSystem";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "KiB";
const exportKind = "const";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Creates a `Size` representing kilobytes (1024 bytes).";
const sourceExample =
  'import { Effect, FileSystem } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n\n  // Create a 64 KiB buffer size for streaming\n  const bufferSize = FileSystem.KiB(64)\n\n  const stream = fs.stream("large-file.txt", {\n    chunkSize: bufferSize\n  })\n\n  // Truncate file to 100 KiB\n  yield* fs.truncate("data.txt", FileSystem.KiB(100))\n})';
const moduleRecord = FileSystemModule as Record<string, unknown>;

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
