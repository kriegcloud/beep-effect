/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: decodeTo
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:14:18.707Z
 *
 * Overview:
 * Creates a schema that transforms from a source schema to a target schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaGetter } from "effect"
 * 
 * const NumberFromString = Schema.String.pipe(
 *   Schema.decodeTo(
 *     Schema.Number,
 *     {
 *       decode: SchemaGetter.transform((s) => Number(s)),
 *       encode: SchemaGetter.transform((n) => String(n))
 *     }
 *   )
 * )
 * 
 * const result = Schema.decodeUnknownSync(NumberFromString)("123")
 * // result: 123
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaModule from "effect/Schema";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "decodeTo";
const exportKind = "function";
const moduleImportPath = "effect/Schema";
const sourceSummary = "Creates a schema that transforms from a source schema to a target schema.";
const sourceExample = "import { Schema, SchemaGetter } from \"effect\"\n\nconst NumberFromString = Schema.String.pipe(\n  Schema.decodeTo(\n    Schema.Number,\n    {\n      decode: SchemaGetter.transform((s) => Number(s)),\n      encode: SchemaGetter.transform((n) => String(n))\n    }\n  )\n)\n\nconst result = Schema.decodeUnknownSync(NumberFromString)(\"123\")\n// result: 123";
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
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
