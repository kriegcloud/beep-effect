/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/JsonPatch
 * Export: JsonPatchOperation
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/JsonPatch.ts
 * Generated: 2026-02-19T04:50:37.186Z
 *
 * Overview:
 * A single JSON Patch operation.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as JsonPatch from "effect/JsonPatch"
 *
 * const addOp: JsonPatch.JsonPatchOperation = {
 *   op: "add",
 *   path: "/users/-",
 *   value: { id: 1, name: "Alice" }
 * }
 *
 * const removeOp: JsonPatch.JsonPatchOperation = {
 *   op: "remove",
 *   path: "/users/0"
 * }
 *
 * const replaceOp: JsonPatch.JsonPatchOperation = {
 *   op: "replace",
 *   path: "/users/0/name",
 *   value: "Bob"
 * }
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as JsonPatchModule from "effect/JsonPatch";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "JsonPatchOperation";
const exportKind = "type";
const moduleImportPath = "effect/JsonPatch";
const sourceSummary = "A single JSON Patch operation.";
const sourceExample =
  'import * as JsonPatch from "effect/JsonPatch"\n\nconst addOp: JsonPatch.JsonPatchOperation = {\n  op: "add",\n  path: "/users/-",\n  value: { id: 1, name: "Alice" }\n}\n\nconst removeOp: JsonPatch.JsonPatchOperation = {\n  op: "remove",\n  path: "/users/0"\n}\n\nconst replaceOp: JsonPatch.JsonPatchOperation = {\n  op: "replace",\n  path: "/users/0/name",\n  value: "Bob"\n}';
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
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
