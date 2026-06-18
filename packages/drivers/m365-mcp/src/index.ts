/**
 * Microsoft 365 Model Context Protocol stdio server.
 *
 * @remarks
 * This package exposes read-only Microsoft 365 driver verbs as schema-first MCP
 * tools. It intentionally delegates Graph auth, transport, decoding, and
 * redaction to `@beep/m365`.
 *
 * @example
 * ```ts
 * import { makeServerLayer, M365McpServerConfig } from "@beep/m365-mcp"
 * import { M365 } from "@beep/m365"
 * import { NodeRuntime, NodeStdio } from "@effect/platform-node"
 * import { Layer } from "effect"
 *
 * Layer.launch(
 *   makeServerLayer(
 *     M365McpServerConfig.make({ name: "beep-m365", version: "0.1.0" }),
 *   ).pipe(Layer.provide(NodeStdio.layer), Layer.provide(M365.layer)),
 * ).pipe(NodeRuntime.runMain)
 * ```
 *
 * @category Package
 * @since 0.1.0
 */
export * from "./M365Handlers.ts";
export * from "./M365Tools.ts";
export * from "./Server.ts";

/**
 * Package version.
 *
 * @category Metadata
 * @since 0.1.0
 */
export const VERSION = "0.1.0";
