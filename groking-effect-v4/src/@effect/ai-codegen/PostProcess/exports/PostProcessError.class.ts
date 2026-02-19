/**
 * Export Playground
 *
 * Package: @effect/ai-codegen
 * Module: @effect/ai-codegen/PostProcess
 * Export: PostProcessError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/ai-codegen/src/PostProcess.ts
 * Generated: 2026-02-19T04:13:34.691Z
 *
 * Overview:
 * Error during post-processing (lint or format).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as PostProcess from "@effect/ai-codegen/PostProcess"
 *
 * const error = new PostProcess.PostProcessError({
 *   step: "lint",
 *   command: "pnpm exec oxlint --fix /path/to/file.ts",
 *   filePath: "/path/to/file.ts",
 *   exitCode: 1,
 *   stdout: "",
 *   stderr: "error: some lint error",
 *   cause: new Error("Lint failed")
 * })
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
import * as PostProcessModule from "@effect/ai-codegen/PostProcess";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "PostProcessError";
const exportKind = "class";
const moduleImportPath = "@effect/ai-codegen/PostProcess";
const sourceSummary = "Error during post-processing (lint or format).";
const sourceExample =
  'import * as PostProcess from "@effect/ai-codegen/PostProcess"\n\nconst error = new PostProcess.PostProcessError({\n  step: "lint",\n  command: "pnpm exec oxlint --fix /path/to/file.ts",\n  filePath: "/path/to/file.ts",\n  exitCode: 1,\n  stdout: "",\n  stderr: "error: some lint error",\n  cause: new Error("Lint failed")\n})';
const moduleRecord = PostProcessModule as Record<string, unknown>;

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
