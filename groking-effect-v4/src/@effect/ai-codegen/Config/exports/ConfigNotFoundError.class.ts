/**
 * Export Playground
 *
 * Package: @effect/ai-codegen
 * Module: @effect/ai-codegen/Config
 * Export: ConfigNotFoundError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/ai-codegen/src/Config.ts
 * Generated: 2026-02-19T04:13:34.651Z
 *
 * Overview:
 * Error when a codegen configuration file is not found.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Config from "@effect/ai-codegen/Config"
 * 
 * const error = new Config.ConfigNotFoundError({
 *   provider: "openai",
 *   expectedPath: "/path/to/packages/ai/openai/codegen.json"
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigModule from "@effect/ai-codegen/Config";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ConfigNotFoundError";
const exportKind = "class";
const moduleImportPath = "@effect/ai-codegen/Config";
const sourceSummary = "Error when a codegen configuration file is not found.";
const sourceExample = "import * as Config from \"@effect/ai-codegen/Config\"\n\nconst error = new Config.ConfigNotFoundError({\n  provider: \"openai\",\n  expectedPath: \"/path/to/packages/ai/openai/codegen.json\"\n})";
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
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
