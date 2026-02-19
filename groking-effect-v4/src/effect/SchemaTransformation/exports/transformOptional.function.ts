/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaTransformation
 * Export: transformOptional
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaTransformation.ts
 * Generated: 2026-02-19T04:14:19.708Z
 *
 * Overview:
 * Creates a `Transformation` where decode and encode operate on `Option` values, giving full control over missing-key handling.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Schema, SchemaTransformation } from "effect"
 * 
 * const schema = Schema.Struct({
 *   a: Schema.optionalKey(Schema.Number).pipe(
 *     Schema.decodeTo(
 *       Schema.Option(Schema.Number),
 *       SchemaTransformation.transformOptional({
 *         decode: Option.some,
 *         encode: Option.flatten
 *       })
 *     )
 *   )
 * })
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaTransformationModule from "effect/SchemaTransformation";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "transformOptional";
const exportKind = "function";
const moduleImportPath = "effect/SchemaTransformation";
const sourceSummary = "Creates a `Transformation` where decode and encode operate on `Option` values, giving full control over missing-key handling.";
const sourceExample = "import { Option, Schema, SchemaTransformation } from \"effect\"\n\nconst schema = Schema.Struct({\n  a: Schema.optionalKey(Schema.Number).pipe(\n    Schema.decodeTo(\n      Schema.Option(Schema.Number),\n      SchemaTransformation.transformOptional({\n        decode: Option.some,\n        encode: Option.flatten\n      })\n    )\n  )\n})";
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
