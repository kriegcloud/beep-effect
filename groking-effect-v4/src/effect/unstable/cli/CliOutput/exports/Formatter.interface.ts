/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliOutput
 * Export: Formatter
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliOutput.ts
 * Generated: 2026-02-19T04:14:24.425Z
 *
 * Overview:
 * Service interface for formatting CLI output including help, errors, and version info. This allows customization of output formatting, including color support.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliOutput } from "effect/unstable/cli"
 * 
 * // Create a custom formatter implementation
 * const customFormatter: CliOutput.Formatter = {
 *   formatHelpDoc: (doc) => `Custom Help: ${doc.usage}`,
 *   formatCliError: (error) => `Error: ${error.message}`,
 *   formatError: (error) => `[ERROR] ${error.message}`,
 *   formatVersion: (name, version) => `${name} (${version})`,
 *   formatErrors: (errors) => errors.map((error) => error.message).join("\\n")
 * }
 * 
 * // Use the custom formatter in a program
 * const program = Effect.gen(function*() {
 *   const formatter = yield* CliOutput.Formatter
 *   const helpText = formatter.formatVersion("myapp", "1.0.0")
 *   console.log(helpText)
 * }).pipe(
 *   Effect.provide(CliOutput.layer(customFormatter))
 * )
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CliOutputModule from "effect/unstable/cli/CliOutput";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Formatter";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/cli/CliOutput";
const sourceSummary = "Service interface for formatting CLI output including help, errors, and version info. This allows customization of output formatting, including color support.";
const sourceExample = "import { Effect } from \"effect\"\nimport { CliOutput } from \"effect/unstable/cli\"\n\n// Create a custom formatter implementation\nconst customFormatter: CliOutput.Formatter = {\n  formatHelpDoc: (doc) => `Custom Help: ${doc.usage}`,\n  formatCliError: (error) => `Error: ${error.message}`,\n  formatError: (error) => `[ERROR] ${error.message}`,\n  formatVersion: (name, version) => `${name} (${version})`,\n  formatErrors: (errors) => errors.map((error) => error.message).join(\"\\\\n\")\n}\n\n// Use the custom formatter in a program\nconst program = Effect.gen(function*() {\n  const formatter = yield* CliOutput.Formatter\n  const helpText = formatter.formatVersion(\"myapp\", \"1.0.0\")\n  console.log(helpText)\n}).pipe(\n  Effect.provide(CliOutput.layer(customFormatter))\n)";
const moduleRecord = CliOutputModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
