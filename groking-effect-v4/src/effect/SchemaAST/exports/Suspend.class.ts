/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaAST
 * Export: Suspend
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/SchemaAST.ts
 * Generated: 2026-02-19T04:14:19.125Z
 *
 * Overview:
 * AST node for lazy/recursive schemas.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaAST } from "effect"
 * 
 * interface Category {
 *   readonly name: string
 *   readonly children: ReadonlyArray<Category>
 * }
 * 
 * const Category: Schema.Schema<Category> = Schema.Struct({
 *   name: Schema.String,
 *   children: Schema.Array(Schema.suspend(() => Category))
 * })
 * 
 * // The recursive branch is a Suspend node
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchemaASTModule from "effect/SchemaAST";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Suspend";
const exportKind = "class";
const moduleImportPath = "effect/SchemaAST";
const sourceSummary = "AST node for lazy/recursive schemas.";
const sourceExample = "import { Schema, SchemaAST } from \"effect\"\n\ninterface Category {\n  readonly name: string\n  readonly children: ReadonlyArray<Category>\n}\n\nconst Category: Schema.Schema<Category> = Schema.Struct({\n  name: Schema.String,\n  children: Schema.Array(Schema.suspend(() => Category))\n})\n\n// The recursive branch is a Suspend node";
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
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
