/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: passthrough
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:50:40.364Z
 *
 * Overview:
 * Returns the identity getter — passes the value through unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaGetter } from "effect"
 *
 * // No transformation needed — types already match
 * const StringToString = Schema.String.pipe(
 *   Schema.decodeTo(Schema.String, {
 *     decode: SchemaGetter.passthrough(),
 *     encode: SchemaGetter.passthrough()
 *   })
 * )
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
const exportName = "passthrough";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Returns the identity getter — passes the value through unchanged.";
const sourceExample =
  'import { Schema, SchemaGetter } from "effect"\n\n// No transformation needed — types already match\nconst StringToString = Schema.String.pipe(\n  Schema.decodeTo(Schema.String, {\n    decode: SchemaGetter.passthrough(),\n    encode: SchemaGetter.passthrough()\n  })\n)';
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
