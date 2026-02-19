/**
 * Export Playground
 *
 * Package: @effect/openapi-generator
 * Module: @effect/openapi-generator/OpenApiPatch
 * Export: JsonPatchApplicationError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/openapi-generator/src/OpenApiPatch.ts
 * Generated: 2026-02-19T04:13:59.762Z
 *
 * Overview:
 * Error thrown when applying a JSON Patch operation fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as OpenApiPatch from "@effect/openapi-generator/OpenApiPatch"
 * 
 * const error = new OpenApiPatch.JsonPatchApplicationError({
 *   source: "./patches/fix.json",
 *   operationIndex: 2,
 *   operation: "remove",
 *   path: "/paths/~1users",
 *   reason: "Property \"users\" does not exist"
 * })
 * 
 * console.log(error.message)
 * // "Failed to apply patch from ./patches/fix.json: operation 2 (remove at /paths/~1users): Property \"users\" does not exist"
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
const exportName = "JsonPatchApplicationError";
const exportKind = "class";
const moduleImportPath = "@effect/openapi-generator/OpenApiPatch";
const sourceSummary = "Error thrown when applying a JSON Patch operation fails.";
const sourceExample = "import * as OpenApiPatch from \"@effect/openapi-generator/OpenApiPatch\"\n\nconst error = new OpenApiPatch.JsonPatchApplicationError({\n  source: \"./patches/fix.json\",\n  operationIndex: 2,\n  operation: \"remove\",\n  path: \"/paths/~1users\",\n  reason: \"Property \\\"users\\\" does not exist\"\n})\n\nconsole.log(error.message)\n// \"Failed to apply patch from ./patches/fix.json: operation 2 (remove at /paths/~1users): Property \\\"users\\\" does not exist\"";
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
