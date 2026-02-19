/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: MissingOption
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:50:46.211Z
 *
 * Overview:
 * Error thrown when a required option is missing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const missingOptionError = new CliError.MissingOption({
 *   option: "api-key"
 * })
 *
 * console.log(missingOptionError.message)
 * // "Missing required flag: --api-key"
 *
 * // In validation context
 * const validateRequiredOptions = (options: Record<string, string | undefined>) =>
 *   Effect.gen(function*() {
 *     const apiKey = options["api-key"]
 *     if (!apiKey) {
 *       return yield* Effect.fail(missingOptionError)
 *     }
 *     return apiKey
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
const exportName = "MissingOption";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Error thrown when a required option is missing.";
const sourceExample =
  'import { Effect } from "effect"\nimport { CliError } from "effect/unstable/cli"\n\nconst missingOptionError = new CliError.MissingOption({\n  option: "api-key"\n})\n\nconsole.log(missingOptionError.message)\n// "Missing required flag: --api-key"\n\n// In validation context\nconst validateRequiredOptions = (options: Record<string, string | undefined>) =>\n  Effect.gen(function*() {\n    const apiKey = options["api-key"]\n    if (!apiKey) {\n      return yield* Effect.fail(missingOptionError)\n    }\n    return apiKey\n  })';
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
