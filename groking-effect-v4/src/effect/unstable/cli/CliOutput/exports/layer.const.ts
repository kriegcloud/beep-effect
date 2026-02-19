/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliOutput
 * Export: layer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliOutput.ts
 * Generated: 2026-02-19T04:50:46.225Z
 *
 * Overview:
 * Creates a Layer that provides a custom Formatter implementation.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Console from "effect/Console"
 * import * as Effect from "effect/Effect"
 * import { CliOutput } from "effect/unstable/cli"
 *
 * // Create a custom formatter without colors
 * const noColorFormatter = CliOutput.defaultFormatter({ colors: false })
 * const NoColorLayer = CliOutput.layer(noColorFormatter)
 *
 * // Create a program that uses the custom formatter
 * const program = Effect.gen(function*() {
 *   const formatter = yield* CliOutput.Formatter
 *   const versionText = formatter.formatVersion("my-cli", "1.0.0")
 *   yield* Console.log(`Using custom formatter: ${versionText}`)
 * }).pipe(
 *   Effect.provide(NoColorLayer)
 * )
 *
 * // You can also create completely custom formatters
 * const jsonFormatter: CliOutput.Formatter = {
 *   formatHelpDoc: (doc) => JSON.stringify(doc, null, 2),
 *   formatCliError: (error) => JSON.stringify({ error: error.message }),
 *   formatError: (error) =>
 *     JSON.stringify({ type: "error", message: error.message }),
 *   formatVersion: (name, version) => JSON.stringify({ name, version }),
 *   formatErrors: (errors) => JSON.stringify(errors.map((error) => error.message))
 * }
 * const JsonLayer = CliOutput.layer(jsonFormatter)
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
import * as CliOutputModule from "effect/unstable/cli/CliOutput";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layer";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/CliOutput";
const sourceSummary = "Creates a Layer that provides a custom Formatter implementation.";
const sourceExample =
  'import * as Console from "effect/Console"\nimport * as Effect from "effect/Effect"\nimport { CliOutput } from "effect/unstable/cli"\n\n// Create a custom formatter without colors\nconst noColorFormatter = CliOutput.defaultFormatter({ colors: false })\nconst NoColorLayer = CliOutput.layer(noColorFormatter)\n\n// Create a program that uses the custom formatter\nconst program = Effect.gen(function*() {\n  const formatter = yield* CliOutput.Formatter\n  const versionText = formatter.formatVersion("my-cli", "1.0.0")\n  yield* Console.log(`Using custom formatter: ${versionText}`)\n}).pipe(\n  Effect.provide(NoColorLayer)\n)\n\n// You can also create completely custom formatters\nconst jsonFormatter: CliOutput.Formatter = {\n  formatHelpDoc: (doc) => JSON.stringify(doc, null, 2),\n  formatCliError: (error) => JSON.stringify({ error: error.message }),\n  formatError: (error) =>\n    JSON.stringify({ type: "error", message: error.message }),\n  formatVersion: (name, version) => JSON.stringify({ name, version }),\n  formatErrors: (errors) => JSON.stringify(errors.map((error) => error.message))\n}\nconst JsonLayer = CliOutput.layer(jsonFormatter)';
const moduleRecord = CliOutputModule as Record<string, unknown>;

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
