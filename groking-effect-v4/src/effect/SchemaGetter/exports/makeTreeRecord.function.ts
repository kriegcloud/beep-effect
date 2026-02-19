/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: makeTreeRecord
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:50:40.364Z
 *
 * Overview:
 * Builds a nested tree object from a list of bracket-path entries.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter } from "effect"
 *
 * const tree = SchemaGetter.makeTreeRecord([
 *   ["user[name]", "Alice"],
 *   ["user[tags][]", "admin"],
 *   ["user[tags][]", "editor"]
 * ])
 * // { user: { name: "Alice", tags: ["admin", "editor"] } }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaGetterModule from "effect/SchemaGetter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeTreeRecord";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Builds a nested tree object from a list of bracket-path entries.";
const sourceExample =
  'import { SchemaGetter } from "effect"\n\nconst tree = SchemaGetter.makeTreeRecord([\n  ["user[name]", "Alice"],\n  ["user[tags][]", "admin"],\n  ["user[tags][]", "editor"]\n])\n// { user: { name: "Alice", tags: ["admin", "editor"] } }';
const moduleRecord = SchemaGetterModule as Record<string, unknown>;

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
