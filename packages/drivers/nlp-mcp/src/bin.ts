/**
 * stdio entrypoint for the `@beep/nlp` MCP server.
 *
 * Launches the {@link Server.makeServerLayer} stdio-transport MCP server so an
 * MCP client (e.g. an editor or agent runtime) can call the NLP tools over
 * standard input/output. Register in an MCP client config by pointing it at this
 * file via `bun run`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeStdio from "@effect/platform-node/NodeStdio";
import { Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { makeServerLayer } from "./Server.ts";

/**
 * The server identity advertised to MCP clients by this entrypoint.
 *
 * @since 0.0.0
 * @category configuration
 */
export const SERVER_CONFIG = { name: "beep-nlp", version: "0.0.0" } as const;

Layer.launch(
  makeServerLayer(SERVER_CONFIG).pipe(
    Layer.provide(NodeStdio.layer),
    Layer.provide(NodeFileSystem.layer),
    Layer.provide(NodePath.layer),
    Layer.provide(FetchHttpClient.layer)
  )
).pipe(NodeRuntime.runMain);
