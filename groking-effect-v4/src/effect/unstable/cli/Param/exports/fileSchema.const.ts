/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: fileSchema
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.509Z
 *
 * Overview:
 * Creates a parameter that reads and validates file content using a schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import * as Param from "effect/unstable/cli/Param"
 * // @internal - this module is not exported publicly
 *
 * // Parse JSON config file
 * const configSchema = Schema.Struct({
 *   port: Schema.Number,
 *   host: Schema.String
 * }).pipe(Schema.fromJsonString)
 *
 * const config = Param.fileSchema(Param.flagKind, "config", configSchema, {
 *   format: "json"
 * })
 *
 * // Parse YAML file
 * const yamlConfig = Param.fileSchema(Param.flagKind, "config", configSchema, {
 *   format: "yaml"
 * })
 *
 * // Usage: --config config.json (reads and validates file content)
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
import * as ParamModule from "effect/unstable/cli/Param";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fileSchema";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Creates a parameter that reads and validates file content using a schema.";
const sourceExample =
  'import { Schema } from "effect"\nimport * as Param from "effect/unstable/cli/Param"\n// @internal - this module is not exported publicly\n\n// Parse JSON config file\nconst configSchema = Schema.Struct({\n  port: Schema.Number,\n  host: Schema.String\n}).pipe(Schema.fromJsonString)\n\nconst config = Param.fileSchema(Param.flagKind, "config", configSchema, {\n  format: "json"\n})\n\n// Parse YAML file\nconst yamlConfig = Param.fileSchema(Param.flagKind, "config", configSchema, {\n  format: "yaml"\n})\n\n// Usage: --config config.json (reads and validates file content)';
const moduleRecord = ParamModule as Record<string, unknown>;

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
