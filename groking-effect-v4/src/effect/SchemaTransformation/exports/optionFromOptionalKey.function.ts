/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaTransformation
 * Export: optionFromOptionalKey
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaTransformation.ts
 * Generated: 2026-02-19T04:50:40.615Z
 *
 * Overview:
 * Decodes an optional struct key into `Option<T>` and encodes `Option<T>` back to an optional key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaTransformation } from "effect"
 *
 * const schema = Schema.Struct({
 *   name: Schema.optionalKey(Schema.String).pipe(
 *     Schema.decodeTo(
 *       Schema.Option(Schema.String),
 *       SchemaTransformation.optionFromOptionalKey()
 *     )
 *   )
 * })
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
import * as SchemaTransformationModule from "effect/SchemaTransformation";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "optionFromOptionalKey";
const exportKind = "function";
const moduleImportPath = "effect/SchemaTransformation";
const sourceSummary =
  "Decodes an optional struct key into `Option<T>` and encodes `Option<T>` back to an optional key.";
const sourceExample =
  'import { Schema, SchemaTransformation } from "effect"\n\nconst schema = Schema.Struct({\n  name: Schema.optionalKey(Schema.String).pipe(\n    Schema.decodeTo(\n      Schema.Option(Schema.String),\n      SchemaTransformation.optionFromOptionalKey()\n    )\n  )\n})';
const moduleRecord = SchemaTransformationModule as Record<string, unknown>;

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
