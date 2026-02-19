/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaAST
 * Export: resolve
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SchemaAST.ts
 * Generated: 2026-02-19T04:50:40.338Z
 *
 * Overview:
 * Returns all annotations from the AST node.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaAST } from "effect"
 *
 * const schema = Schema.String.annotate({ title: "Name" })
 * const annotations = SchemaAST.resolve(schema.ast)
 * console.log(annotations?.title) // "Name"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaASTModule from "effect/SchemaAST";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "resolve";
const exportKind = "const";
const moduleImportPath = "effect/SchemaAST";
const sourceSummary = "Returns all annotations from the AST node.";
const sourceExample =
  'import { Schema, SchemaAST } from "effect"\n\nconst schema = Schema.String.annotate({ title: "Name" })\nconst annotations = SchemaAST.resolve(schema.ast)\nconsole.log(annotations?.title) // "Name"';
const moduleRecord = SchemaASTModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
