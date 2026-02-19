/**
 * Export Playground
 *
 * Package: @effect/ai-codegen
 * Module: @effect/ai-codegen/Generator
 * Export: GenerationError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/ai-codegen/src/Generator.ts
 * Generated: 2026-02-19T04:13:34.667Z
 *
 * Overview:
 * Error during code generation.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Generator from "@effect/ai-codegen/Generator"
 * 
 * const error = new Generator.GenerationError({
 *   provider: "openai",
 *   cause: new Error("Invalid spec")
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
import * as GeneratorModule from "@effect/ai-codegen/Generator";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "GenerationError";
const exportKind = "class";
const moduleImportPath = "@effect/ai-codegen/Generator";
const sourceSummary = "Error during code generation.";
const sourceExample = "import * as Generator from \"@effect/ai-codegen/Generator\"\n\nconst error = new Generator.GenerationError({\n  provider: \"openai\",\n  cause: new Error(\"Invalid spec\")\n})";
const moduleRecord = GeneratorModule as Record<string, unknown>;

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
