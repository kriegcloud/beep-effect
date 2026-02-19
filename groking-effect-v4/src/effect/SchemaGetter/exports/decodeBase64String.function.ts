/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: decodeBase64String
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:14:19.180Z
 *
 * Overview:
 * Decodes a Base64 string to a UTF-8 `string`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { SchemaGetter } from "effect"
 *
 * const decode = SchemaGetter.decodeBase64String<string>()
 * // Getter<string, string>
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
const exportName = "decodeBase64String";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Decodes a Base64 string to a UTF-8 `string`.";
const sourceExample =
  'import { SchemaGetter } from "effect"\n\nconst decode = SchemaGetter.decodeBase64String<string>()\n// Getter<string, string>';
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
