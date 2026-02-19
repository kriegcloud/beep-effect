/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: decode
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:50:40.196Z
 *
 * Overview:
 * Applies a transformation to a schema, creating a new schema with the same type but transformed encoding/decoding.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaGetter } from "effect"
 *
 * const Trimmed = Schema.String.pipe(
 *   Schema.decode({
 *     decode: SchemaGetter.transform((s) => s.trim()),
 *     encode: SchemaGetter.transform((s) => s.trim())
 *   })
 * )
 *
 * const result = Schema.decodeUnknownSync(Trimmed)("  hello  ")
 * // result: "hello"
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
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "decode";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary =
  "Applies a transformation to a schema, creating a new schema with the same type but transformed encoding/decoding.";
const sourceExample =
  'import { Schema, SchemaGetter } from "effect"\n\nconst Trimmed = Schema.String.pipe(\n  Schema.decode({\n    decode: SchemaGetter.transform((s) => s.trim()),\n    encode: SchemaGetter.transform((s) => s.trim())\n  })\n)\n\nconst result = Schema.decodeUnknownSync(Trimmed)("  hello  ")\n// result: "hello"';
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
