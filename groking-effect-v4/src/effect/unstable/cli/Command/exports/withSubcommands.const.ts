/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: withSubcommands
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:14:24.445Z
 *
 * Overview:
 * Adds subcommands to a command, creating a hierarchical command structure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * // Parent command with global flags
 * const git = Command.make("git", {
 *   verbose: Flag.boolean("verbose")
 * })
 *
 * // Subcommand that accesses parent config
 * const clone = Command.make("clone", {
 *   repository: Flag.string("repo")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     const parent = yield* git // Access parent's parsed config
 *     if (parent.verbose) {
 *       yield* Console.log("Verbose mode enabled")
 *     }
 *     yield* Console.log(`Cloning ${config.repository}`)
 *   }))
 *
 * const app = git.pipe(Command.withSubcommands([clone]))
 * // Usage: git --verbose clone --repo github.com/foo/bar
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CommandModule from "effect/unstable/cli/Command";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withSubcommands";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary = "Adds subcommands to a command, creating a hierarchical command structure.";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport { Command, Flag } from "effect/unstable/cli"\n\n// Parent command with global flags\nconst git = Command.make("git", {\n  verbose: Flag.boolean("verbose")\n})\n\n// Subcommand that accesses parent config\nconst clone = Command.make("clone", {\n  repository: Flag.string("repo")\n}, (config) =>\n  Effect.gen(function*() {\n    const parent = yield* git // Access parent\'s parsed config\n    if (parent.verbose) {\n      yield* Console.log("Verbose mode enabled")\n    }\n    yield* Console.log(`Cloning ${config.repository}`)\n  }))\n\nconst app = git.pipe(Command.withSubcommands([clone]))\n// Usage: git --verbose clone --repo github.com/foo/bar';
const moduleRecord = CommandModule as Record<string, unknown>;

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
  bunContext: BunContext,
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
