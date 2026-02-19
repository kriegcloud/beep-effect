/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: UnknownSubcommand
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:14:24.414Z
 *
 * Overview:
 * Error thrown when an unknown subcommand is encountered.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const unknownSubcommandError = new CliError.UnknownSubcommand({
 *   subcommand: "deplyo", // typo
 *   parent: ["myapp"],
 *   suggestions: ["deploy", "destroy"]
 * })
 *
 * console.log(unknownSubcommandError.message)
 * // "Unknown subcommand "deplyo" for "myapp"
 * //
 * //  Did you mean this?
 * //    deploy
 * //    destroy"
 *
 * // In subcommand parsing
 * const parseSubcommand = (subcommand: string) =>
 *   Effect.gen(function*() {
 *     const validCommands = ["deploy", "destroy", "status"]
 *     if (!validCommands.includes(subcommand)) {
 *       return yield* Effect.fail(unknownSubcommandError)
 *     }
 *     return subcommand
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CliErrorModule from "effect/unstable/cli/CliError";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "UnknownSubcommand";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Error thrown when an unknown subcommand is encountered.";
const sourceExample =
  'import { Effect } from "effect"\nimport { CliError } from "effect/unstable/cli"\n\nconst unknownSubcommandError = new CliError.UnknownSubcommand({\n  subcommand: "deplyo", // typo\n  parent: ["myapp"],\n  suggestions: ["deploy", "destroy"]\n})\n\nconsole.log(unknownSubcommandError.message)\n// "Unknown subcommand "deplyo" for "myapp"\n//\n//  Did you mean this?\n//    deploy\n//    destroy"\n\n// In subcommand parsing\nconst parseSubcommand = (subcommand: string) =>\n  Effect.gen(function*() {\n    const validCommands = ["deploy", "destroy", "status"]\n    if (!validCommands.includes(subcommand)) {\n      return yield* Effect.fail(unknownSubcommandError)\n    }\n    return subcommand\n  })';
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
