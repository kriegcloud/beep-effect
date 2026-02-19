/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: CommandContext
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:14:24.445Z
 *
 * Overview:
 * Service context for a specific command, enabling subcommands to access their parent's parsed configuration.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const parent = Command.make("app", {
 *   verbose: Flag.boolean("verbose"),
 *   config: Flag.string("config")
 * })
 *
 * const child = Command.make("deploy", {
 *   target: Flag.string("target")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     // Access parent's config by yielding the parent command
 *     const parentConfig = yield* parent
 *     yield* Console.log(`Verbose: ${parentConfig.verbose}`)
 *     yield* Console.log(`Config: ${parentConfig.config}`)
 *     yield* Console.log(`Target: ${config.target}`)
 *   }))
 *
 * const app = parent.pipe(Command.withSubcommands([child]))
 * // Usage: app --verbose --config prod.json deploy --target staging
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CommandModule from "effect/unstable/cli/Command";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CommandContext";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary =
  "Service context for a specific command, enabling subcommands to access their parent's parsed configuration.";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport { Command, Flag } from "effect/unstable/cli"\n\nconst parent = Command.make("app", {\n  verbose: Flag.boolean("verbose"),\n  config: Flag.string("config")\n})\n\nconst child = Command.make("deploy", {\n  target: Flag.string("target")\n}, (config) =>\n  Effect.gen(function*() {\n    // Access parent\'s config by yielding the parent command\n    const parentConfig = yield* parent\n    yield* Console.log(`Verbose: ${parentConfig.verbose}`)\n    yield* Console.log(`Config: ${parentConfig.config}`)\n    yield* Console.log(`Target: ${config.target}`)\n  }))\n\nconst app = parent.pipe(Command.withSubcommands([child]))\n// Usage: app --verbose --config prod.json deploy --target staging';
const moduleRecord = CommandModule as Record<string, unknown>;

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
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
