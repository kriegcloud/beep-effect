/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaGetter
 * Export: transform
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaGetter.ts
 * Generated: 2026-02-19T04:50:40.365Z
 *
 * Overview:
 * Creates a getter that applies a pure function to present values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaGetter } from "effect"
 *
 * const NumberFromString = Schema.String.pipe(
 *   Schema.decodeTo(Schema.Number, {
 *     decode: SchemaGetter.transform((s) => Number(s)),
 *     encode: SchemaGetter.transform((n) => String(n))
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
const exportName = "transform";
const exportKind = "function";
const moduleImportPath = "effect/SchemaGetter";
const sourceSummary = "Creates a getter that applies a pure function to present values.";
const sourceExample =
  'import { Schema, SchemaGetter } from "effect"\n\nconst NumberFromString = Schema.String.pipe(\n  Schema.decodeTo(Schema.Number, {\n    decode: SchemaGetter.transform((s) => Number(s)),\n    encode: SchemaGetter.transform((n) => String(n))\n  })\n)';
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
