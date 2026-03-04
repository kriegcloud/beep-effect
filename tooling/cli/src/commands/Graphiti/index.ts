/**
 * Graphiti command suite.
 *
 * @since 0.0.0
 * @module
 */

import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";
import { runGraphitiProxy } from "./internal/ProxyRuntime.js";

/**
 * Graphiti queue proxy subcommand.
 *
 * @since 0.0.0
 * @category UseCase
 */
const graphitiProxyCommand = Command.make(
  "proxy",
  {},
  Effect.fn(function* () {
    yield* runGraphitiProxy;
  })
).pipe(Command.withDescription("Run the Graphiti MCP queue proxy"));

/**
 * Graphiti command group.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const graphitiCommand = Command.make(
  "graphiti",
  {},
  Effect.fn(function* () {
    yield* Console.log("Graphiti commands:");
    yield* Console.log("- bun run beep graphiti proxy");
  })
).pipe(Command.withDescription("Graphiti operational commands"), Command.withSubcommands([graphitiProxyCommand]));
