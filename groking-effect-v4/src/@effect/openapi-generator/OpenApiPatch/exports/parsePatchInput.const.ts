/**
 * Export Playground
 *
 * Package: @effect/openapi-generator
 * Module: @effect/openapi-generator/OpenApiPatch
 * Export: parsePatchInput
 * Kind: const
 * Source: .repos/effect-smol/packages/tools/openapi-generator/src/OpenApiPatch.ts
 * Generated: 2026-02-19T04:13:59.763Z
 *
 * Overview:
 * Parse a JSON Patch from either a file path or inline JSON string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as OpenApiPatch from "@effect/openapi-generator/OpenApiPatch"
 * 
 * // From inline JSON
 * const fromInline = OpenApiPatch.parsePatchInput(
 *   '[{"op":"replace","path":"/info/title","value":"My API"}]'
 * )
 * 
 * // From file path
 * const fromFile = OpenApiPatch.parsePatchInput("./patches/fix-api.json")
 * 
 * const program = Effect.gen(function*() {
 *   const patch = yield* fromInline
 *   console.log(patch)
 *   // [{ op: "replace", path: "/info/title", value: "My API" }]
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
const exportName = "parsePatchInput";
const exportKind = "const";
const moduleImportPath = "@effect/openapi-generator/OpenApiPatch";
const sourceSummary = "Parse a JSON Patch from either a file path or inline JSON string.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as OpenApiPatch from \"@effect/openapi-generator/OpenApiPatch\"\n\n// From inline JSON\nconst fromInline = OpenApiPatch.parsePatchInput(\n  '[{\"op\":\"replace\",\"path\":\"/info/title\",\"value\":\"My API\"}]'\n)\n\n// From file path\nconst fromFile = OpenApiPatch.parsePatchInput(\"./patches/fix-api.json\")\n\nconst program = Effect.gen(function*() {\n  const patch = yield* fromInline\n  console.log(patch)\n  // [{ op: \"replace\", path: \"/info/title\", value: \"My API\" }]\n})";
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
