/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: joinKeyValue
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:50:40.364Z
 *
 * Overview:
 * Joins a record of key-value pairs into a delimited string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter } from "effect"
 *
 * const join = SchemaGetter.joinKeyValue()
 * // { a: "1", b: "2" } -> "a=1,b=2"
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
const exportName = "joinKeyValue";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Joins a record of key-value pairs into a delimited string.";
const sourceExample =
  'import { SchemaGetter } from "effect"\n\nconst join = SchemaGetter.joinKeyValue()\n// { a: "1", b: "2" } -> "a=1,b=2"';
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
