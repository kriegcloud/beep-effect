/**
 * Graphiti command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import {
  ensureGraphitiProxy,
  type GraphitiProxyOpsError,
  installGraphitiProxyService,
  recoverGraphitiStack,
} from "./internal/ProxyOps.js";
import { runGraphitiProxy } from "./internal/ProxyRuntime.js";

/**
 * Graphiti queue proxy subcommand.
 *
 * @example
 * ```ts
 * console.log("graphiti proxy")
 * ```
 * @category utilities
 * @since 0.0.0
 */
const graphitiProxyCommand = Command.make(
  "proxy",
  {},
  Effect.fn(function* () {
    yield* runGraphitiProxy;
  })
).pipe(Command.withDescription("Run the Graphiti MCP queue proxy"));

const runProxyOpsProgram = <A, R>(program: Effect.Effect<A, GraphitiProxyOpsError, R>) =>
  program.pipe(
    Effect.catchTag(
      "GraphitiProxyOpsError",
      Effect.fn(function* (error) {
        process.exitCode = error.exitCode ?? 1;
        yield* Console.error(`[graphiti-proxy] ${error.message}`);
      })
    ),
    Effect.asVoid
  );

const graphitiProxyEnsureCommand = Command.make("ensure", {}, () => runProxyOpsProgram(ensureGraphitiProxy())).pipe(
  Command.withDescription("Ensure the Graphiti MCP queue proxy is healthy")
);

const graphitiProxyServiceInstallCommand = Command.make("install", {}, () =>
  runProxyOpsProgram(installGraphitiProxyService())
).pipe(Command.withDescription("Install and start the Graphiti proxy user service"));

const graphitiProxyServiceCommand = Command.make(
  "service",
  {},
  Effect.fn(function* () {
    yield* Console.log("Graphiti proxy service commands:");
    yield* Console.log("- bun run beep graphiti proxy service install");
  })
).pipe(
  Command.withDescription("Graphiti proxy user service commands"),
  Command.withSubcommands([graphitiProxyServiceInstallCommand])
);

const graphitiRecoverCommand = Command.make(
  "recover",
  {
    dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Print planned recovery actions without side effects")),
    force: Flag.boolean("force").pipe(Flag.withDescription("Restart backing containers even when they are healthy")),
  },
  ({ dryRun, force }) => runProxyOpsProgram(recoverGraphitiStack({ dryRun, force }))
).pipe(Command.withDescription("Recover the local Graphiti backing stack"));

/**
 * Graphiti command group.
 *
 * @example
 * ```ts
 * console.log("graphitiCommand")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const graphitiCommand = Command.make(
  "graphiti",
  {},
  Effect.fn(function* () {
    yield* Console.log("Graphiti commands:");
    yield* Console.log("- bun run beep graphiti proxy");
    yield* Console.log("- bun run beep graphiti proxy ensure");
    yield* Console.log("- bun run beep graphiti proxy service install");
    yield* Console.log("- bun run beep graphiti recover --dry-run");
  })
).pipe(
  Command.withDescription("Graphiti operational commands"),
  Command.withSubcommands([
    graphitiProxyCommand.pipe(Command.withSubcommands([graphitiProxyEnsureCommand, graphitiProxyServiceCommand])),
    graphitiRecoverCommand,
  ])
);
