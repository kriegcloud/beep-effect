/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/JsonPatch
 * Export: JsonPatch
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/JsonPatch.ts
 * Generated: 2026-02-19T04:14:14.249Z
 *
 * Overview:
 * A JSON Patch document (an ordered list of operations).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as JsonPatch from "effect/JsonPatch"
 * 
 * const patch: JsonPatch.JsonPatch = [
 *   { op: "add", path: "/items/-", value: "apple" },
 *   { op: "replace", path: "/count", value: 5 },
 *   { op: "remove", path: "/oldField" }
 * ]
 * 
 * const result = JsonPatch.apply(patch, { count: 3, oldField: "value" })
 * // { count: 5, items: ["apple"] }
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as JsonPatchModule from "effect/JsonPatch";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "JsonPatch";
const exportKind = "type";
const moduleImportPath = "effect/JsonPatch";
const sourceSummary = "A JSON Patch document (an ordered list of operations).";
const sourceExample = "import * as JsonPatch from \"effect/JsonPatch\"\n\nconst patch: JsonPatch.JsonPatch = [\n  { op: \"add\", path: \"/items/-\", value: \"apple\" },\n  { op: \"replace\", path: \"/count\", value: 5 },\n  { op: \"remove\", path: \"/oldField\" }\n]\n\nconst result = JsonPatch.apply(patch, { count: 3, oldField: \"value\" })\n// { count: 5, items: [\"apple\"] }";
const moduleRecord = JsonPatchModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
