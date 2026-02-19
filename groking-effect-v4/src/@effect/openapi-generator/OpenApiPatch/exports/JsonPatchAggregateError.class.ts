/**
 * Export Playground
 *
 * Package: @effect/openapi-generator
 * Module: @effect/openapi-generator/OpenApiPatch
 * Export: JsonPatchAggregateError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/openapi-generator/src/OpenApiPatch.ts
 * Generated: 2026-02-19T04:13:59.762Z
 *
 * Overview:
 * Error thrown when multiple JSON Patch operations fail.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as OpenApiPatch from "@effect/openapi-generator/OpenApiPatch"
 *
 * const error = new OpenApiPatch.JsonPatchAggregateError({
 *   errors: [
 *     new OpenApiPatch.JsonPatchApplicationError({
 *       source: "./fix.json",
 *       operationIndex: 0,
 *       operation: "replace",
 *       path: "/info/x",
 *       reason: "Property does not exist"
 *     }),
 *     new OpenApiPatch.JsonPatchApplicationError({
 *       source: "./fix.json",
 *       operationIndex: 2,
 *       operation: "remove",
 *       path: "/paths/~1users",
 *       reason: "Property does not exist"
 *     })
 *   ]
 * })
 *
 * console.log(error.message)
 * // "2 patch operations failed:\n  1. ..."
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
import * as OpenApiPatchModule from "@effect/openapi-generator/OpenApiPatch";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "JsonPatchAggregateError";
const exportKind = "class";
const moduleImportPath = "@effect/openapi-generator/OpenApiPatch";
const sourceSummary = "Error thrown when multiple JSON Patch operations fail.";
const sourceExample =
  'import * as OpenApiPatch from "@effect/openapi-generator/OpenApiPatch"\n\nconst error = new OpenApiPatch.JsonPatchAggregateError({\n  errors: [\n    new OpenApiPatch.JsonPatchApplicationError({\n      source: "./fix.json",\n      operationIndex: 0,\n      operation: "replace",\n      path: "/info/x",\n      reason: "Property does not exist"\n    }),\n    new OpenApiPatch.JsonPatchApplicationError({\n      source: "./fix.json",\n      operationIndex: 2,\n      operation: "remove",\n      path: "/paths/~1users",\n      reason: "Property does not exist"\n    })\n  ]\n})\n\nconsole.log(error.message)\n// "2 patch operations failed:\\n  1. ..."';
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
