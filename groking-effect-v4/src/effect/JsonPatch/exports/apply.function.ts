/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/JsonPatch
 * Export: apply
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/JsonPatch.ts
 * Generated: 2026-02-19T04:14:14.249Z
 *
 * Overview:
 * Apply a JSON Patch to a document.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as JsonPatch from "effect/JsonPatch"
 * 
 * const document = { items: [1, 2, 3], total: 6 }
 * const patch: JsonPatch.JsonPatch = [
 *   { op: "add", path: "/items/-", value: 4 },
 *   { op: "replace", path: "/total", value: 10 }
 * ]
 * 
 * const result = JsonPatch.apply(patch, document)
 * // { items: [1, 2, 3, 4], total: 10 }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as JsonPatchModule from "effect/JsonPatch";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "apply";
const exportKind = "function";
const moduleImportPath = "effect/JsonPatch";
const sourceSummary = "Apply a JSON Patch to a document.";
const sourceExample = "import * as JsonPatch from \"effect/JsonPatch\"\n\nconst document = { items: [1, 2, 3], total: 6 }\nconst patch: JsonPatch.JsonPatch = [\n  { op: \"add\", path: \"/items/-\", value: 4 },\n  { op: \"replace\", path: \"/total\", value: 10 }\n]\n\nconst result = JsonPatch.apply(patch, document)\n// { items: [1, 2, 3, 4], total: 10 }";
const moduleRecord = JsonPatchModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
