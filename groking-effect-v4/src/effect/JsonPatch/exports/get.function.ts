/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/JsonPatch
 * Export: get
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/JsonPatch.ts
 * Generated: 2026-02-19T04:14:14.249Z
 *
 * Overview:
 * Compute a patch that transforms `oldValue` into `newValue`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as JsonPatch from "effect/JsonPatch"
 *
 * const oldValue = { users: [{ id: 1, name: "Alice" }], count: 1 }
 * const newValue = { users: [{ id: 1, name: "Bob" }, { id: 2, name: "Charlie" }], count: 2 }
 *
 * const patch = JsonPatch.get(oldValue, newValue)
 * // [
 * //   { op: "replace", path: "/users/0/name", value: "Bob" },
 * //   { op: "add", path: "/users/1", value: { id: 2, name: "Charlie" } },
 * //   { op: "replace", path: "/count", value: 2 }
 * // ]
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as JsonPatchModule from "effect/JsonPatch";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "get";
const exportKind = "function";
const moduleImportPath = "effect/JsonPatch";
const sourceSummary = "Compute a patch that transforms `oldValue` into `newValue`.";
const sourceExample =
  'import * as JsonPatch from "effect/JsonPatch"\n\nconst oldValue = { users: [{ id: 1, name: "Alice" }], count: 1 }\nconst newValue = { users: [{ id: 1, name: "Bob" }, { id: 2, name: "Charlie" }], count: 2 }\n\nconst patch = JsonPatch.get(oldValue, newValue)\n// [\n//   { op: "replace", path: "/users/0/name", value: "Bob" },\n//   { op: "add", path: "/users/1", value: { id: 2, name: "Charlie" } },\n//   { op: "replace", path: "/count", value: 2 }\n// ]';
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
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
