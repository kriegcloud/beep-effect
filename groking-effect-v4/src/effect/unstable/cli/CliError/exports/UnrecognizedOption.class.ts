/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: UnrecognizedOption
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:14:24.414Z
 *
 * Overview:
 * Error thrown when an unrecognized option is encountered.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * // Creating an unrecognized option error
 * const unrecognizedError = new CliError.UnrecognizedOption({
 *   option: "--unknown-flag",
 *   command: ["deploy", "production"],
 *   suggestions: ["--verbose", "--force"]
 * })
 *
 * console.log(unrecognizedError.message)
 * // "Unrecognized flag: --unknown-flag in command deploy production
 * //
 * //  Did you mean this?
 * //    --verbose
 * //    --force"
 *
 * // In CLI parsing context
 * const parseCommand = Effect.gen(function*() {
 *   // If parsing encounters unknown flag
 *   return yield* Effect.fail(unrecognizedError)
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CliErrorModule from "effect/unstable/cli/CliError";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "UnrecognizedOption";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Error thrown when an unrecognized option is encountered.";
const sourceExample =
  'import { Effect } from "effect"\nimport { CliError } from "effect/unstable/cli"\n\n// Creating an unrecognized option error\nconst unrecognizedError = new CliError.UnrecognizedOption({\n  option: "--unknown-flag",\n  command: ["deploy", "production"],\n  suggestions: ["--verbose", "--force"]\n})\n\nconsole.log(unrecognizedError.message)\n// "Unrecognized flag: --unknown-flag in command deploy production\n//\n//  Did you mean this?\n//    --verbose\n//    --force"\n\n// In CLI parsing context\nconst parseCommand = Effect.gen(function*() {\n  // If parsing encounters unknown flag\n  return yield* Effect.fail(unrecognizedError)\n})';
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
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
