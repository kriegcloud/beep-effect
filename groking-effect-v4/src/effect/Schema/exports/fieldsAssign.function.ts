/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: fieldsAssign
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:14:18.709Z
 *
 * Overview:
 * A shortcut for `MyStruct.mapFields(Struct.assign(fields))`. This is useful when you want to add new fields to an existing struct or a union of structs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, Tuple } from "effect"
 *
 * // Add a new field to all members of a union of structs
 * const schema = Schema.Union([
 *   Schema.Struct({ a: Schema.String }),
 *   Schema.Struct({ b: Schema.Number })
 * ]).mapMembers(Tuple.map(Schema.fieldsAssign({ c: Schema.Number })))
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
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fieldsAssign";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary =
  "A shortcut for `MyStruct.mapFields(Struct.assign(fields))`. This is useful when you want to add new fields to an existing struct or a union of structs.";
const sourceExample =
  'import { Schema, Tuple } from "effect"\n\n// Add a new field to all members of a union of structs\nconst schema = Schema.Union([\n  Schema.Struct({ a: Schema.String }),\n  Schema.Struct({ b: Schema.Number })\n]).mapMembers(Tuple.map(Schema.fieldsAssign({ c: Schema.Number })))';
const moduleRecord = SchemaModule as Record<string, unknown>;

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
