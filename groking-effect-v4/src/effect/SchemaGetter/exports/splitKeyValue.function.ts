/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: splitKeyValue
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:14:19.184Z
 *
 * Overview:
 * Parses a string into a record of key-value pairs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter } from "effect"
 *
 * const parse = SchemaGetter.splitKeyValue<string>()
 * // "a=1,b=2" -> { a: "1", b: "2" }
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
import * as SchemaGetterModule from "effect/SchemaGetter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "splitKeyValue";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Parses a string into a record of key-value pairs.";
const sourceExample =
  'import { SchemaGetter } from "effect"\n\nconst parse = SchemaGetter.splitKeyValue<string>()\n// "a=1,b=2" -> { a: "1", b: "2" }';
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
