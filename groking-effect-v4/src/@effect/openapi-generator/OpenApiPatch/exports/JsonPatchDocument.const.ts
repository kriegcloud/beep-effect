/**
 * Export Playground
 *
 * Package: @effect/openapi-generator
 * Module: @effect/openapi-generator/OpenApiPatch
 * Export: JsonPatchDocument
 * Kind: const
 * Source: .repos/effect-smol/packages/tools/openapi-generator/src/OpenApiPatch.ts
 * Generated: 2026-02-19T04:13:59.763Z
 *
 * Overview:
 * Schema for a JSON Patch document (array of operations).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import * as OpenApiPatch from "@effect/openapi-generator/OpenApiPatch"
 *
 * const patch = Schema.decodeUnknownSync(OpenApiPatch.JsonPatchDocument)([
 *   { op: "add", path: "/foo", value: "bar" },
 *   { op: "remove", path: "/baz" },
 *   { op: "replace", path: "/qux", value: 42 }
 * ])
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
import * as OpenApiPatchModule from "@effect/openapi-generator/OpenApiPatch";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "JsonPatchDocument";
const exportKind = "const";
const moduleImportPath = "@effect/openapi-generator/OpenApiPatch";
const sourceSummary = "Schema for a JSON Patch document (array of operations).";
const sourceExample =
  'import { Schema } from "effect"\nimport * as OpenApiPatch from "@effect/openapi-generator/OpenApiPatch"\n\nconst patch = Schema.decodeUnknownSync(OpenApiPatch.JsonPatchDocument)([\n  { op: "add", path: "/foo", value: "bar" },\n  { op: "remove", path: "/baz" },\n  { op: "replace", path: "/qux", value: 42 }\n])';
const moduleRecord = OpenApiPatchModule as Record<string, unknown>;

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
  bunContext: BunContext,
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
