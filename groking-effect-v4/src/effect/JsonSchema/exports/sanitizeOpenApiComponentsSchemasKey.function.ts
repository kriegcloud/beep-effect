/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/JsonSchema
 * Export: sanitizeOpenApiComponentsSchemasKey
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/JsonSchema.ts
 * Generated: 2026-02-19T04:50:37.218Z
 *
 * Overview:
 * Returns a sanitized key for an OpenAPI component schema. Should match the `^[a-zA-Z0-9.\-_]+$` regular expression.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as JsonSchemaModule from "effect/JsonSchema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "sanitizeOpenApiComponentsSchemasKey";
const exportKind = "function";
const moduleImportPath = "effect/JsonSchema";
const sourceSummary =
  "Returns a sanitized key for an OpenAPI component schema. Should match the `^[a-zA-Z0-9.\\-_]+$` regular expression.";
const sourceExample = "";
const moduleRecord = JsonSchemaModule as Record<string, unknown>;

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
