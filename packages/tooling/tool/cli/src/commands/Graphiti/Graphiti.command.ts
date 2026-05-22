/**
 * Graphiti command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect, flow, pipe } from "effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { printLines } from "../../internal/cli/Printer.js";
import {
  ensureGraphitiProxy,
  type GraphitiProxyOpsError,
  installGraphitiProxyService,
  recoverGraphitiStack,
  runKgWithGraphitiProxy,
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
const graphitiProxyCommand = pipe(
  Command.make("proxy", {}, () => runGraphitiProxy),
  Command.withDescription("Run the Graphiti MCP queue proxy")
);

const runProxyOpsProgram = <A, R>(program: Effect.Effect<A, GraphitiProxyOpsError, R>) => program.pipe(Effect.asVoid);

const graphitiProxyEnsureCommand = pipe(
  Command.make("ensure", {}, () => runProxyOpsProgram(ensureGraphitiProxy())),
  Command.withDescription("Ensure the Graphiti MCP queue proxy is healthy")
);

const graphitiProxyKgCommand = pipe(
  Command.make(
    "kg",
    {
      args: pipe(Argument.string("args"), Argument.variadic({ min: 1 })),
    },
    ({ args }) => pipe(args, runKgWithGraphitiProxy, runProxyOpsProgram)
  ),
  Command.withDescription("Run a knowledge-graph command through the Graphiti proxy")
);

const graphitiProxyServiceInstallCommand = pipe(
  Command.make("install", {}, flow(installGraphitiProxyService, runProxyOpsProgram)),
  Command.withDescription("Install and start the Graphiti proxy user service")
);

const graphitiProxyServiceCommand = pipe(
  Command.make("service", {}, () =>
    printLines(["Graphiti proxy service commands:", "- bun run beep graphiti proxy service install"])
  ),
  Command.withDescription("Graphiti proxy user service commands"),
  Command.withSubcommands([graphitiProxyServiceInstallCommand])
);

const graphitiRecoverCommand = pipe(
  Command.make(
    "recover",
    {
      dryRun: pipe(
        Flag.boolean("dry-run"),
        Flag.withDescription("Print" + " planned recovery actions without side effects")
      ),
      force: pipe(
        Flag.boolean("force"),
        Flag.withDescription("Restart" + " backing containers even when they are healthy")
      ),
    },
    flow(recoverGraphitiStack, runProxyOpsProgram)
  ),
  Command.withDescription("Recover the local Graphiti backing stack")
);

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
export const graphitiCommand = pipe(
  Command.make("graphiti", {}, () =>
    printLines([
      "Graphiti commands:",
      "- bun run beep graphiti proxy",
      "- bun run beep graphiti proxy ensure",
      "- bun run beep graphiti proxy kg -- verify --target both",
      "- bun run beep graphiti proxy service install",
      "- bun run beep graphiti recover --dry-run",
    ])
  ),
  Command.withDescription("Graphiti operational commands"),
  Command.withSubcommands([
    pipe(
      graphitiProxyCommand,
      Command.withSubcommands([graphitiProxyEnsureCommand, graphitiProxyKgCommand, graphitiProxyServiceCommand])
    ),
    graphitiRecoverCommand,
  ])
);
