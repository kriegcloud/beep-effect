/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Argument
 * Export: fileSchema
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Argument.ts
 * Generated: 2026-02-19T04:50:46.201Z
 *
 * Overview:
 * Creates a positional argument that reads and validates file content using a schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Argument } from "effect/unstable/cli"
 *
 * const ConfigSchema = Schema.Struct({
 *   port: Schema.Number,
 *   host: Schema.String
 * })
 *
 * const JsonConfigSchema = Schema.fromJsonString(ConfigSchema)
 *
 * const config = Argument.fileSchema("config", JsonConfigSchema)
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
import * as ArgumentModule from "effect/unstable/cli/Argument";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fileSchema";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Argument";
const sourceSummary = "Creates a positional argument that reads and validates file content using a schema.";
const sourceExample =
  'import { Schema } from "effect"\nimport { Argument } from "effect/unstable/cli"\n\nconst ConfigSchema = Schema.Struct({\n  port: Schema.Number,\n  host: Schema.String\n})\n\nconst JsonConfigSchema = Schema.fromJsonString(ConfigSchema)\n\nconst config = Argument.fileSchema("config", JsonConfigSchema)';
const moduleRecord = ArgumentModule as Record<string, unknown>;

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
