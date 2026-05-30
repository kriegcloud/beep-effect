/**
 * stdio entrypoint for the @beep/nlp MCP server.
 *
 * Launches the {@link Server.makeServerLayer} stdio-transport MCP server so an
 * MCP client (e.g. an editor or agent runtime) can call the NLP tools over
 * standard input/output. Register in an MCP client config by pointing it at this
 * file via `bun run`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeStdio from "@effect/platform-node/NodeStdio";
import * as Layer from "effect/Layer";
import { makeServerLayer } from "./Server.ts";

/**
 * The server identity advertised to MCP clients by this entrypoint.
 *
 * @since 0.0.0
 * @category configuration
 */
export const SERVER_CONFIG = { name: "beep-nlp", version: "0.0.0" } as const;

Layer.launch(makeServerLayer(SERVER_CONFIG).pipe(Layer.provide(NodeStdio.layer))).pipe(NodeRuntime.runMain);
