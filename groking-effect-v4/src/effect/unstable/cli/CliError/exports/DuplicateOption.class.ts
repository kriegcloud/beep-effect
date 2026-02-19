/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: DuplicateOption
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:14:24.414Z
 *
 * Overview:
 * Error thrown when duplicate option names are detected between parent and child commands.
 *
 * Source JSDoc Example:
 * ```ts
 * import { CliError } from "effect/unstable/cli"
 * 
 * const duplicateError = new CliError.DuplicateOption({
 *   option: "--verbose",
 *   parentCommand: "myapp",
 *   childCommand: "deploy"
 * })
 * 
 * console.log(duplicateError.message)
 * // "Duplicate flag name "--verbose" in parent command "myapp" and subcommand "deploy".
 * // Parent will always claim this flag (Mode A semantics). Consider renaming one of them to avoid confusion."
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
const exportName = "DuplicateOption";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Error thrown when duplicate option names are detected between parent and child commands.";
const sourceExample = "import { CliError } from \"effect/unstable/cli\"\n\nconst duplicateError = new CliError.DuplicateOption({\n  option: \"--verbose\",\n  parentCommand: \"myapp\",\n  childCommand: \"deploy\"\n})\n\nconsole.log(duplicateError.message)\n// \"Duplicate flag name \"--verbose\" in parent command \"myapp\" and subcommand \"deploy\".\n// Parent will always claim this flag (Mode A semantics). Consider renaming one of them to avoid confusion.\"";
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
