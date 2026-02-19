/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: MissingArgument
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:50:46.211Z
 *
 * Overview:
 * Error thrown when a required positional argument is missing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const missingArgError = new CliError.MissingArgument({
 *   argument: "target"
 * })
 *
 * console.log(missingArgError.message)
 * // "Missing required argument: target"
 *
 * // In argument parsing
 * const parseArguments = (args: Array<string>) =>
 *   Effect.gen(function*() {
 *     if (args.length === 0) {
 *       return yield* Effect.fail(missingArgError)
 *     }
 *     return args[0]
 *   })
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CliErrorModule from "effect/unstable/cli/CliError";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MissingArgument";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Error thrown when a required positional argument is missing.";
const sourceExample =
  'import { Effect } from "effect"\nimport { CliError } from "effect/unstable/cli"\n\nconst missingArgError = new CliError.MissingArgument({\n  argument: "target"\n})\n\nconsole.log(missingArgError.message)\n// "Missing required argument: target"\n\n// In argument parsing\nconst parseArguments = (args: Array<string>) =>\n  Effect.gen(function*() {\n    if (args.length === 0) {\n      return yield* Effect.fail(missingArgError)\n    }\n    return args[0]\n  })';
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
