/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: TiB
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:50:36.446Z
 *
 * Overview:
 * Creates a `Size` representing tebibytes (1024⁴ bytes).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Check if we're dealing with very large files
 *   const stats = yield* fs.stat("database-backup.sql")
 *   const oneTiB = FileSystem.TiB(1)
 *
 *   if (stats.size > oneTiB) {
 *     yield* Console.log("This is a very large database backup!")
 *
 *     // Use larger chunk sizes for such files
 *     const stream = fs.stream("database-backup.sql", {
 *       chunkSize: FileSystem.MiB(100) // 100 MiB chunks
 *     })
 *   }
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
import * as FileSystemModule from "effect/FileSystem";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TiB";
const exportKind = "const";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Creates a `Size` representing tebibytes (1024⁴ bytes).";
const sourceExample =
  'import { Console, Effect, FileSystem } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n\n  // Check if we\'re dealing with very large files\n  const stats = yield* fs.stat("database-backup.sql")\n  const oneTiB = FileSystem.TiB(1)\n\n  if (stats.size > oneTiB) {\n    yield* Console.log("This is a very large database backup!")\n\n    // Use larger chunk sizes for such files\n    const stream = fs.stream("database-backup.sql", {\n      chunkSize: FileSystem.MiB(100) // 100 MiB chunks\n    })\n  }\n})';
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
