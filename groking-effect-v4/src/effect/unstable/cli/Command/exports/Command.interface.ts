/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: Command
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:14:24.444Z
 *
 * Overview:
 * Represents a CLI command with its configuration, handler, and metadata.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console } from "effect"
 * import { Argument, Command, Flag } from "effect/unstable/cli"
 * 
 * // Simple command with no configuration
 * const version: Command.Command<"version", {}, never, never> = Command.make(
 *   "version"
 * )
 * 
 * // Command with flags and arguments
 * const deploy: Command.Command<
 *   "deploy",
 *   {
 *     readonly env: string
 *     readonly force: boolean
 *     readonly files: ReadonlyArray<string>
 *   },
 *   never,
 *   never
 * > = Command.make("deploy", {
 *   env: Flag.string("env"),
 *   force: Flag.boolean("force"),
 *   files: Argument.string("files").pipe(Argument.variadic())
 * })
 * 
 * // Command with handler
 * const greet = Command.make("greet", {
 *   name: Flag.string("name")
 * }, (config) => Console.log(`Hello, ${config.name}!`))
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
import * as CommandModule from "effect/unstable/cli/Command";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Command";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary = "Represents a CLI command with its configuration, handler, and metadata.";
const sourceExample = "import { Console } from \"effect\"\nimport { Argument, Command, Flag } from \"effect/unstable/cli\"\n\n// Simple command with no configuration\nconst version: Command.Command<\"version\", {}, never, never> = Command.make(\n  \"version\"\n)\n\n// Command with flags and arguments\nconst deploy: Command.Command<\n  \"deploy\",\n  {\n    readonly env: string\n    readonly force: boolean\n    readonly files: ReadonlyArray<string>\n  },\n  never,\n  never\n> = Command.make(\"deploy\", {\n  env: Flag.string(\"env\"),\n  force: Flag.boolean(\"force\"),\n  files: Argument.string(\"files\").pipe(Argument.variadic())\n})\n\n// Command with handler\nconst greet = Command.make(\"greet\", {\n  name: Flag.string(\"name\")\n}, (config) => Console.log(`Hello, ${config.name}!`))";
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
