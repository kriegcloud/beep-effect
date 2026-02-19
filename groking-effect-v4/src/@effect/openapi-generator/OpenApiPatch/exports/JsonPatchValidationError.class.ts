/**
 * Export Playground
 *
 * Package: @effect/openapi-generator
 * Module: @effect/openapi-generator/OpenApiPatch
 * Export: JsonPatchValidationError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/openapi-generator/src/OpenApiPatch.ts
 * Generated: 2026-02-19T04:13:59.763Z
 *
 * Overview:
 * Error thrown when a parsed value does not conform to the JSON Patch schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as OpenApiPatch from "@effect/openapi-generator/OpenApiPatch"
 * 
 * const error = new OpenApiPatch.JsonPatchValidationError({
 *   source: "inline",
 *   reason: "Expected 'add' | 'remove' | 'replace' at [0].op, got 'copy'"
 * })
 * 
 * console.log(error.message)
 * // "Invalid JSON Patch from inline: Expected 'add' | 'remove' | 'replace' at [0].op, got 'copy'"
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as OpenApiPatchModule from "@effect/openapi-generator/OpenApiPatch";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "JsonPatchValidationError";
const exportKind = "class";
const moduleImportPath = "@effect/openapi-generator/OpenApiPatch";
const sourceSummary = "Error thrown when a parsed value does not conform to the JSON Patch schema.";
const sourceExample = "import * as OpenApiPatch from \"@effect/openapi-generator/OpenApiPatch\"\n\nconst error = new OpenApiPatch.JsonPatchValidationError({\n  source: \"inline\",\n  reason: \"Expected 'add' | 'remove' | 'replace' at [0].op, got 'copy'\"\n})\n\nconsole.log(error.message)\n// \"Invalid JSON Patch from inline: Expected 'add' | 'remove' | 'replace' at [0].op, got 'copy'\"";
const moduleRecord = OpenApiPatchModule as Record<string, unknown>;

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
