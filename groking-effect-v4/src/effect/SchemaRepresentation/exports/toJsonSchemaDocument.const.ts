/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaRepresentation
 * Export: toJsonSchemaDocument
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SchemaRepresentation.ts
 * Generated: 2026-02-19T04:14:19.668Z
 *
 * Overview:
 * Converts a {@link Document} to a Draft 2020-12 JSON Schema document.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 *
 * const doc = SchemaRepresentation.fromAST(Schema.String.ast)
 * const jsonSchema = SchemaRepresentation.toJsonSchemaDocument(doc)
 * console.log(jsonSchema.schema.type)
 * // "string"
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SchemaRepresentationModule from "effect/SchemaRepresentation";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toJsonSchemaDocument";
const exportKind = "const";
const moduleImportPath = "effect/SchemaRepresentation";
const sourceSummary = "Converts a {@link Document} to a Draft 2020-12 JSON Schema document.";
const sourceExample =
  'import { Schema, SchemaRepresentation } from "effect"\n\nconst doc = SchemaRepresentation.fromAST(Schema.String.ast)\nconst jsonSchema = SchemaRepresentation.toJsonSchemaDocument(doc)\nconsole.log(jsonSchema.schema.type)\n// "string"';
const moduleRecord = SchemaRepresentationModule as Record<string, unknown>;

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
  bunContext: BunContext,
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
