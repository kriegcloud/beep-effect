/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FileSystem
 * Export: layerNoop
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FileSystem.ts
 * Generated: 2026-02-19T04:50:36.446Z
 *
 * Overview:
 * Creates a Layer that provides a no-op FileSystem implementation for testing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * // Create a test layer with specific behaviors
 * const testLayer = FileSystem.layerNoop({
 *   readFileString: (path) => Effect.succeed("mocked content"),
 *   exists: () => Effect.succeed(true)
 * })
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *   const content = yield* fs.readFileString("any-file.txt")
 *   return content
 * })
 *
 * // Provide the test layer
 * const testProgram = Effect.provide(program, testLayer)
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
const exportName = "layerNoop";
const exportKind = "const";
const moduleImportPath = "effect/FileSystem";
const sourceSummary = "Creates a Layer that provides a no-op FileSystem implementation for testing.";
const sourceExample =
  'import { Effect, FileSystem } from "effect"\n\n// Create a test layer with specific behaviors\nconst testLayer = FileSystem.layerNoop({\n  readFileString: (path) => Effect.succeed("mocked content"),\n  exists: () => Effect.succeed(true)\n})\n\nconst program = Effect.gen(function*() {\n  const fs = yield* FileSystem.FileSystem\n  const content = yield* fs.readFileString("any-file.txt")\n  return content\n})\n\n// Provide the test layer\nconst testProgram = Effect.provide(program, testLayer)';
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
