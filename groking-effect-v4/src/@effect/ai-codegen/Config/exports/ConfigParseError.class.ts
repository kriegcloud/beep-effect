/**
 * Export Playground
 *
 * Package: @effect/ai-codegen
 * Module: @effect/ai-codegen/Config
 * Export: ConfigParseError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/ai-codegen/src/Config.ts
 * Generated: 2026-02-19T04:13:34.651Z
 *
 * Overview:
 * Error when parsing a codegen configuration file fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Config from "@effect/ai-codegen/Config"
 *
 * const error = new Config.ConfigParseError({
 *   path: "/path/to/codegen.json",
 *   cause: new Error("Invalid JSON")
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
import * as ConfigModule from "@effect/ai-codegen/Config";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ConfigParseError";
const exportKind = "class";
const moduleImportPath = "@effect/ai-codegen/Config";
const sourceSummary = "Error when parsing a codegen configuration file fails.";
const sourceExample =
  'import * as Config from "@effect/ai-codegen/Config"\n\nconst error = new Config.ConfigParseError({\n  path: "/path/to/codegen.json",\n  cause: new Error("Invalid JSON")\n})';
const moduleRecord = ConfigModule as Record<string, unknown>;

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
