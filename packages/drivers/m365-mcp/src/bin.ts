/**
 * Microsoft 365 MCP stdio executable.
 *
 * @category services
 * @since 0.1.0
 */
import { M365 } from "@beep/m365";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeStdio from "@effect/platform-node/NodeStdio";
import { Layer } from "effect";
import { M365McpServerConfig, makeServerLayer } from "./index.ts";

const M365_MCP_VERSION = "0.1.0";

const ServerConfig = M365McpServerConfig.make({
  name: "beep-m365",
  version: M365_MCP_VERSION,
});

Layer.launch(makeServerLayer(ServerConfig).pipe(Layer.provide(NodeStdio.layer), Layer.provide(M365.layer))).pipe(
  NodeRuntime.runMain
);
