/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaRepresentation
 * Export: toCodeDocument
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/SchemaRepresentation.ts
 * Generated: 2026-02-19T04:14:19.668Z
 *
 * Overview:
 * Generates TypeScript code strings from a {@link MultiDocument}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 *
 * const Person = Schema.Struct({
 *   name: Schema.String,
 *   age: Schema.Int
 * })
 *
 * const multi = SchemaRepresentation.toMultiDocument(
 *   SchemaRepresentation.fromAST(Person.ast)
 * )
 * const codeDoc = SchemaRepresentation.toCodeDocument(multi)
 * console.log(codeDoc.codes[0].runtime)
 * // Schema.Struct({ ... })
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
import * as SchemaRepresentationModule from "effect/SchemaRepresentation";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toCodeDocument";
const exportKind = "function";
const moduleImportPath = "effect/SchemaRepresentation";
const sourceSummary = "Generates TypeScript code strings from a {@link MultiDocument}.";
const sourceExample =
  'import { Schema, SchemaRepresentation } from "effect"\n\nconst Person = Schema.Struct({\n  name: Schema.String,\n  age: Schema.Int\n})\n\nconst multi = SchemaRepresentation.toMultiDocument(\n  SchemaRepresentation.fromAST(Person.ast)\n)\nconst codeDoc = SchemaRepresentation.toCodeDocument(multi)\nconsole.log(codeDoc.codes[0].runtime)\n// Schema.Struct({ ... })';
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
