/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaAST
 * Export: Objects
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/SchemaAST.ts
 * Generated: 2026-02-19T04:14:19.124Z
 *
 * Overview:
 * AST node for object-like types — both structs and records.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaAST } from "effect"
 *
 * const schema = Schema.Struct({ name: Schema.String })
 * const ast = schema.ast
 *
 * if (SchemaAST.isObjects(ast)) {
 *   for (const ps of ast.propertySignatures) {
 *     console.log(ps.name, ps.type._tag)
 *   }
 *   // "name" "String"
 * }
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaASTModule from "effect/SchemaAST";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Objects";
const exportKind = "class";
const moduleImportPath = "effect/SchemaAST";
const sourceSummary = "AST node for object-like types — both structs and records.";
const sourceExample =
  'import { Schema, SchemaAST } from "effect"\n\nconst schema = Schema.Struct({ name: Schema.String })\nconst ast = schema.ast\n\nif (SchemaAST.isObjects(ast)) {\n  for (const ps of ast.propertySignatures) {\n    console.log(ps.name, ps.type._tag)\n  }\n  // "name" "String"\n}';
const moduleRecord = SchemaASTModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
