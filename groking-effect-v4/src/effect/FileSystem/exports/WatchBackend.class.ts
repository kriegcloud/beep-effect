/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: WatchBackend
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:14:13.237Z
 *
 * Overview:
 * Service key for file system watch backend implementations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FileSystem, Stream } from "effect"
 *
 * // Custom watch backend implementation
 * const customWatchBackend = {
 *   register: (path: string, stat: FileSystem.File.Info) => {
 *     // Implementation would depend on platform
 *     return Stream.empty // Placeholder implementation
 *   }
 * }
 *
 * // Provide custom watch backend
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // File watching will use the custom backend
 *   const watcher = fs.watch("./directory")
 * })
 *
 * const withCustomBackend = Effect.provideService(
 *   program,
 *   FileSystem.WatchBackend,
 *   customWatchBackend
 * )
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystemModule from "effect/FileSystem";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "WatchBackend";
const exportKind = "class";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Service key for file system watch backend implementations.";
const sourceExample =
  'import { Effect, FileSystem, Stream } from "effect"\n\n// Custom watch backend implementation\nconst customWatchBackend = {\n  register: (path: string, stat: FileSystem.File.Info) => {\n    // Implementation would depend on platform\n    return Stream.empty // Placeholder implementation\n  }\n}\n\n// Provide custom watch backend\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n\n  // File watching will use the custom backend\n  const watcher = fs.watch("./directory")\n})\n\nconst withCustomBackend = Effect.provideService(\n  program,\n  FileSystem.WatchBackend,\n  customWatchBackend\n)';
const moduleRecord = FileSystemModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
