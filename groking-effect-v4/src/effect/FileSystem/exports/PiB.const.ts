/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: PiB
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:50:36.446Z
 *
 * Overview:
 * Creates a `Size` representing pebibytes (1024⁵ bytes).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // For extremely large data processing scenarios
 *   const massiveDataset = FileSystem.PiB(2) // 2 PiB
 *
 *   // This would typically be used in enterprise/cloud scenarios
 *   yield* Console.log(`Processing ${massiveDataset} bytes of data`)
 *
 *   // Such large files would require specialized streaming
 *   const stream = fs.stream("massive-dataset.bin", {
 *     chunkSize: FileSystem.GiB(1), // 1 GiB chunks
 *     offset: FileSystem.TiB(100) // Start from 100 TiB offset
 *   })
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
const exportName = "PiB";
const exportKind = "const";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Creates a `Size` representing pebibytes (1024⁵ bytes).";
const sourceExample =
  'import { Console, Effect, FileSystem } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n\n  // For extremely large data processing scenarios\n  const massiveDataset = FileSystem.PiB(2) // 2 PiB\n\n  // This would typically be used in enterprise/cloud scenarios\n  yield* Console.log(`Processing ${massiveDataset} bytes of data`)\n\n  // Such large files would require specialized streaming\n  const stream = fs.stream("massive-dataset.bin", {\n    chunkSize: FileSystem.GiB(1), // 1 GiB chunks\n    offset: FileSystem.TiB(100) // Start from 100 TiB offset\n  })\n})';
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
