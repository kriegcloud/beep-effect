/**
 * Graphiti command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";
import { runGraphitiProxy } from "./internal/ProxyRuntime.js";

/**
 * Graphiti queue proxy subcommand.
 *
 * @example
 * ```ts
 * console.log("docgen metadata")
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
  })
).pipe(Command.withDescription("Graphiti operational commands"), Command.withSubcommands([graphitiProxyCommand]));
