/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: InvalidValue
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:14:24.414Z
 *
 * Overview:
 * Error thrown when an option or argument value is invalid.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 * 
 * const invalidValueError = new CliError.InvalidValue({
 *   option: "port",
 *   value: "abc123",
 *   expected: "integer between 1 and 65535",
 *   kind: "flag"
 * })
 * 
 * console.log(invalidValueError.message)
 * // "Invalid value for flag --port: "abc123". Expected: integer between 1 and 65535"
 * 
 * // For positional arguments
 * const invalidArgError = new CliError.InvalidValue({
 *   option: "count",
 *   value: "abc",
 *   expected: "integer",
 *   kind: "argument"
 * })
 * 
 * console.log(invalidArgError.message)
 * // "Invalid value for argument <count>: "abc". Expected: integer"
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CliErrorModule from "effect/unstable/cli/CliError";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "InvalidValue";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Error thrown when an option or argument value is invalid.";
const sourceExample = "import { Effect } from \"effect\"\nimport { CliError } from \"effect/unstable/cli\"\n\nconst invalidValueError = new CliError.InvalidValue({\n  option: \"port\",\n  value: \"abc123\",\n  expected: \"integer between 1 and 65535\",\n  kind: \"flag\"\n})\n\nconsole.log(invalidValueError.message)\n// \"Invalid value for flag --port: \"abc123\". Expected: integer between 1 and 65535\"\n\n// For positional arguments\nconst invalidArgError = new CliError.InvalidValue({\n  option: \"count\",\n  value: \"abc\",\n  expected: \"integer\",\n  kind: \"argument\"\n})\n\nconsole.log(invalidArgError.message)\n// \"Invalid value for argument <count>: \"abc\". Expected: integer\"";
const moduleRecord = CliErrorModule as Record<string, unknown>;

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
