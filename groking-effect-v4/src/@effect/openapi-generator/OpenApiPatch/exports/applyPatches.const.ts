/**
 * Export Playground
 *
 * Package: @effect/openapi-generator
 * Module: @effect/openapi-generator/OpenApiPatch
 * Export: applyPatches
 * Kind: const
 * Source: .repos/effect-smol/packages/tools/openapi-generator/src/OpenApiPatch.ts
 * Generated: 2026-02-19T04:13:59.762Z
 *
 * Overview:
 * Apply a sequence of JSON patches to a document.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as OpenApiPatch from "@effect/openapi-generator/OpenApiPatch"
 * 
 * const document = { info: { title: "Old Title" }, paths: {} }
 * const patches = [
 *   {
 *     source: "inline",
 *     patch: [{ op: "replace" as const, path: "/info/title", value: "New Title" }]
 *   }
 * ]
 * 
 * const program = Effect.gen(function*() {
 *   const result = yield* OpenApiPatch.applyPatches(patches, document)
 *   console.log(result)
 *   // { info: { title: "New Title" }, paths: {} }
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as OpenApiPatchModule from "@effect/openapi-generator/OpenApiPatch";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "applyPatches";
const exportKind = "const";
const moduleImportPath = "@effect/openapi-generator/OpenApiPatch";
const sourceSummary = "Apply a sequence of JSON patches to a document.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as OpenApiPatch from \"@effect/openapi-generator/OpenApiPatch\"\n\nconst document = { info: { title: \"Old Title\" }, paths: {} }\nconst patches = [\n  {\n    source: \"inline\",\n    patch: [{ op: \"replace\" as const, path: \"/info/title\", value: \"New Title\" }]\n  }\n]\n\nconst program = Effect.gen(function*() {\n  const result = yield* OpenApiPatch.applyPatches(patches, document)\n  console.log(result)\n  // { info: { title: \"New Title\" }, paths: {} }\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
