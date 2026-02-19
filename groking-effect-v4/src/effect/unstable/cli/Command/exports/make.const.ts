/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Command
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Command.ts
 * Generated: 2026-02-19T04:50:46.255Z
 *
 * Overview:
 * Creates a Command from a name, optional config, optional handler function, and optional description.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Argument, Command, Flag } from "effect/unstable/cli"
 *
 * // Simple command with no configuration
 * const version = Command.make("version")
 *
 * // Command with simple flags
 * const greet = Command.make("greet", {
 *   name: Flag.string("name"),
 *   count: Flag.integer("count").pipe(Flag.withDefault(1))
 * })
 *
 * // Command with nested configuration
 * const deploy = Command.make("deploy", {
 *   environment: Flag.string("env").pipe(
 *     Flag.withDescription("Target environment")
 *   ),
 *   server: {
 *     host: Flag.string("host").pipe(Flag.withDefault("localhost")),
 *     port: Flag.integer("port").pipe(Flag.withDefault(3000))
 *   },
 *   files: Argument.string("files").pipe(Argument.variadic),
 *   force: Flag.boolean("force").pipe(Flag.withDescription("Force deployment"))
 * })
 *
 * // Command with handler
 * const deployWithHandler = Command.make("deploy", {
 *   environment: Flag.string("env"),
 *   force: Flag.boolean("force")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Starting deployment to ${config.environment}`)
 *
 *     if (!config.force && config.environment === "production") {
 *       return yield* Effect.fail("Production deployments require --force flag")
 *     }
 *
 *     yield* Console.log("Deployment completed successfully")
 *   }))
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CommandModule from "effect/unstable/cli/Command";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Command";
const sourceSummary =
  "Creates a Command from a name, optional config, optional handler function, and optional description.";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport { Argument, Command, Flag } from "effect/unstable/cli"\n\n// Simple command with no configuration\nconst version = Command.make("version")\n\n// Command with simple flags\nconst greet = Command.make("greet", {\n  name: Flag.string("name"),\n  count: Flag.integer("count").pipe(Flag.withDefault(1))\n})\n\n// Command with nested configuration\nconst deploy = Command.make("deploy", {\n  environment: Flag.string("env").pipe(\n    Flag.withDescription("Target environment")\n  ),\n  server: {\n    host: Flag.string("host").pipe(Flag.withDefault("localhost")),\n    port: Flag.integer("port").pipe(Flag.withDefault(3000))\n  },\n  files: Argument.string("files").pipe(Argument.variadic),\n  force: Flag.boolean("force").pipe(Flag.withDescription("Force deployment"))\n})\n\n// Command with handler\nconst deployWithHandler = Command.make("deploy", {\n  environment: Flag.string("env"),\n  force: Flag.boolean("force")\n}, (config) =>\n  Effect.gen(function*() {\n    yield* Console.log(`Starting deployment to ${config.environment}`)\n\n    if (!config.force && config.environment === "production") {\n      return yield* Effect.fail("Production deployments require --force flag")\n    }\n\n    yield* Console.log("Deployment completed successfully")\n  }))';
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
