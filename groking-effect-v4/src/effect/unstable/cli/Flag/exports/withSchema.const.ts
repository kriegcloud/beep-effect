/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: withSchema
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:50:46.274Z
 *
 * Overview:
 * Validates and transforms a flag value using a Schema codec.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Flag } from "effect/unstable/cli"
 *
 * const isEmail = Schema.isIncludes("@", {
 *   message: "Must be a valid email address"
 * })
 *
 * // Parse and validate email with custom schema
 * const EmailSchema = Schema.String.pipe(
 *   Schema.check(isEmail)
 * )
 *
 * const emailFlag = Flag.string("email").pipe(
 *   Flag.withSchema(EmailSchema)
 * )
 *
 * // Parse JSON configuration with schema validation
 * const ConfigSchema = Schema.Struct({
 *   port: Schema.Number,
 *   host: Schema.String,
 *   ssl: Schema.optional(Schema.Boolean)
 * }).pipe(Schema.fromJsonString)
 *
 * const configFlag = Flag.string("config").pipe(
 *   Flag.withSchema(ConfigSchema)
 * )
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
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withSchema";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Validates and transforms a flag value using a Schema codec.";
const sourceExample =
  'import { Schema } from "effect"\nimport { Flag } from "effect/unstable/cli"\n\nconst isEmail = Schema.isIncludes("@", {\n  message: "Must be a valid email address"\n})\n\n// Parse and validate email with custom schema\nconst EmailSchema = Schema.String.pipe(\n  Schema.check(isEmail)\n)\n\nconst emailFlag = Flag.string("email").pipe(\n  Flag.withSchema(EmailSchema)\n)\n\n// Parse JSON configuration with schema validation\nconst ConfigSchema = Schema.Struct({\n  port: Schema.Number,\n  host: Schema.String,\n  ssl: Schema.optional(Schema.Boolean)\n}).pipe(Schema.fromJsonString)\n\nconst configFlag = Flag.string("config").pipe(\n  Flag.withSchema(ConfigSchema)\n)';
const moduleRecord = FlagModule as Record<string, unknown>;

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
