/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaRepresentation
 * Export: toSchema
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaRepresentation.ts
 * Generated: 2026-02-19T04:14:19.668Z
 *
 * Overview:
 * Reconstructs a runtime Schema from a {@link Document}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 * 
 * const doc = SchemaRepresentation.fromAST(
 *   Schema.Struct({ name: Schema.String }).ast
 * )
 * 
 * const schema = SchemaRepresentation.toSchema(doc)
 * console.log(JSON.stringify(Schema.toJsonSchemaDocument(schema), null, 2))
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaRepresentationModule from "effect/SchemaRepresentation";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toSchema";
const exportKind = "function";
const moduleImportPath = "effect/SchemaRepresentation";
const sourceSummary = "Reconstructs a runtime Schema from a {@link Document}.";
const sourceExample = "import { Schema, SchemaRepresentation } from \"effect\"\n\nconst doc = SchemaRepresentation.fromAST(\n  Schema.Struct({ name: Schema.String }).ast\n)\n\nconst schema = SchemaRepresentation.toSchema(doc)\nconsole.log(JSON.stringify(Schema.toJsonSchemaDocument(schema), null, 2))";
const moduleRecord = SchemaRepresentationModule as Record<string, unknown>;

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
